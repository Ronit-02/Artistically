// PATCH /api/admin/appeals/[id] — decide an appeal (admin only)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, ResolveAppealSchema, RouteIdSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const appealId = validate(RouteIdSchema, { id }).id;
  const input = validate(ResolveAppealSchema, await req.json());

  const appeal = await prisma.moderationAppeal.findUnique({
    where: { id: appealId },
    select: {
      id: true,
      reportId: true,
      status: true,
      report: { select: { productId: true, collectionId: true } },
    },
  });
  if (!appeal) return notFound("Appeal not found");
  if (appeal.status !== "OPEN") return forbidden("Only open appeals can be decided");

  const updated = await prisma.$transaction(async (tx) => {
    if (input.status === "APPROVED" && appeal.report.productId) {
      await tx.product.update({ where: { id: appeal.report.productId }, data: { isActive: true } });
    }
    if (input.status === "APPROVED" && appeal.report.collectionId) {
      await tx.collection.update({ where: { id: appeal.report.collectionId }, data: { published: true } });
    }
    await tx.moderationEvent.create({
      data: {
        reportId: appeal.reportId,
        appealId,
        actorId: auth.userId,
        type: input.status === "APPROVED" ? "APPEAL_APPROVED" : "APPEAL_REJECTED",
        note: input.decisionNote,
      },
    });
    return tx.moderationAppeal.update({
      where: { id: appealId },
      data: { status: input.status, reviewerId: auth.userId, decisionNote: input.decisionNote },
    });
  });
  return ok(updated);
});
