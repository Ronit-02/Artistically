// POST /api/reviews           — create a review (auth required)
// GET  /api/reviews?productId= — list reviews for a product
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { validate, CreateReviewSchema, ProductIdSchema } from "@/lib/validators";
import { ok, created, badRequest, forbidden, conflict, withErrorHandler } from "@/lib/api-response";

function toReviewDto<T extends { orderItemId?: string | null }>(review: T) {
  return { ...review, verified: Boolean(review.orderItemId) };
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return badRequest("productId is required");
  const validProductId = validate(ProductIdSchema, { productId }).productId;

  const reviews = await prisma.review.findMany({
    where: { productId: validProductId, moderationStatus: "PUBLISHED" },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(reviews.map(toReviewDto));
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const validProductId = validate(ProductIdSchema, body).productId;
  const input = validate(CreateReviewSchema, body);

  const eligibleOrderItem = await prisma.orderItem.findFirst({
    where: {
      productId: validProductId,
      order: { userId: auth.userId },
      OR: [
        { fulfillmentStatus: "DELIVERED" },
        { order: { status: OrderStatus.DELIVERED } },
      ],
      product: { artist: { userId: { not: auth.userId } } },
    },
    select: { id: true },
  });
  if (!eligibleOrderItem) {
    return forbidden("You can review artwork only after a delivered purchase");
  }

  const existingReview = await prisma.review.findFirst({
    where: { productId: validProductId, userId: auth.userId },
    select: { id: true },
  });
  if (existingReview) {
    return conflict("You have already reviewed this artwork");
  }

  const review = await prisma.review.create({
    data: { ...input, productId: validProductId, userId: auth.userId, orderItemId: eligibleOrderItem.id },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });

  await prisma.auditLog.create({ data: { actorId: auth.userId, action: "REVIEW_CREATED", targetType: "REVIEW", targetId: review.id } });

  return created(toReviewDto(review));
});
