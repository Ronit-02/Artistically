// PATCH /api/admin/reports/[id] — resolve a moderation case (admin only)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, ResolveReportSchema, RouteIdSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const validId = validate(RouteIdSchema, { id }).id;
  const input = validate(ResolveReportSchema, await req.json());

  const report = await prisma.report.findUnique({
    where: { id: validId },
    select: { id: true, status: true, productId: true, collectionId: true },
  });
  if (!report) return notFound("Report not found");
  if (report.status !== "OPEN") return forbidden("Only open reports can be resolved");

  if (input.action === "REMOVE_PRODUCT" && !report.productId) {
    return forbidden("This report does not target artwork");
  }
  if (input.action === "UNPUBLISH_COLLECTION" && !report.collectionId) {
    return forbidden("This report does not target a collection");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.action === "REMOVE_PRODUCT") {
      await tx.product.update({ where: { id: report.productId! }, data: { isActive: false } });
    }
    if (input.action === "UNPUBLISH_COLLECTION") {
      await tx.collection.update({ where: { id: report.collectionId! }, data: { published: false } });
    }
    await tx.moderationEvent.create({
      data: {
        reportId: validId,
        actorId: auth.userId,
        type: input.status === "RESOLVED" ? "REPORT_RESOLVED" : "REPORT_DISMISSED",
        note: input.resolutionNote,
      },
    });
    return tx.report.update({
      where: { id: validId },
      data: {
        status: input.status,
        reviewerId: auth.userId,
        resolutionNote: input.resolutionNote,
      },
    });
  });

  return ok(updated);
});
