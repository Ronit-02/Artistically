// POST /api/reports — submit a moderation report (auth required)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, CreateReportSchema } from "@/lib/validators";
import { created, conflict, notFound, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const input = validate(CreateReportSchema, await req.json());

  if (input.targetType === "PRODUCT") {
    const product = await prisma.product.findUnique({
      where: { id: input.targetId },
      select: { id: true, isActive: true },
    });
    if (!product || !product.isActive) return notFound("Artwork not found");
  } else {
    const collection = await prisma.collection.findUnique({
      where: { id: input.targetId },
      select: { id: true, published: true },
    });
    if (!collection || !collection.published) return notFound("Collection not found");
  }

  const targetWhere = input.targetType === "PRODUCT"
    ? { productId: input.targetId }
    : { collectionId: input.targetId };
  const existing = await prisma.report.findFirst({
    where: { reporterId: auth.userId, status: "OPEN", ...targetWhere },
    select: { id: true },
  });
  if (existing) return conflict("You already have an open report for this item");

  const report = await prisma.$transaction(async (tx) => {
    const createdReport = await tx.report.create({
      data: {
        reporterId: auth.userId,
        reason: input.reason,
        details: input.details,
        ...(input.targetType === "PRODUCT"
          ? { productId: input.targetId }
          : { collectionId: input.targetId }),
      },
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        productId: true,
        collectionId: true,
        createdAt: true,
      },
    });
    await tx.moderationEvent.create({
      data: { reportId: createdReport.id, actorId: auth.userId, type: "REPORT_CREATED" },
    });
    return createdReport;
  });

  return created(report);
});
