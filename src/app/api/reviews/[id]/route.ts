// PATCH  /api/reviews/[id]  — update own review
// DELETE /api/reviews/[id]  — delete own review
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, UpdateReviewSchema } from "@/lib/validators";
import { ok, noContent, notFound, forbidden, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return notFound("Review not found");
  if (review.userId !== auth.userId) return forbidden("You can only edit your own reviews");

  const body = await req.json();
  const input = validate(UpdateReviewSchema, body);
  const updated = await prisma.review.update({ where: { id }, data: input });
  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return notFound("Review not found");
  if (review.userId !== auth.userId && auth.role !== "ADMIN") return forbidden("Not allowed");

  await prisma.review.delete({ where: { id } });
  return noContent();
});
