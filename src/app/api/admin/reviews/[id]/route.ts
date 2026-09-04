import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, ModerateReviewSchema, RouteIdSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const reviewId = validate(RouteIdSchema, { id }).id;
  const input = validate(ModerateReviewSchema, await req.json());
  const existing = await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true } });
  if (!existing) return notFound("Review not found");
  const updated = await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({ where: { id: reviewId }, data: { moderationStatus: input.status, moderationNote: input.moderationNote, moderatedById: auth.userId, moderatedAt: new Date() }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, product: { select: { id: true, title: true } } } });
    await tx.auditLog.create({ data: { actorId: auth.userId, action: `REVIEW_${input.status}`, targetType: "REVIEW", targetId: reviewId, reason: input.moderationNote } });
    return review;
  });
  return ok(updated);
});
