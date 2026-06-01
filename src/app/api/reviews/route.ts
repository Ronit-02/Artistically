// POST /api/reviews           — create a review (auth required)
// GET  /api/reviews?productId= — list reviews for a product
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, CreateReviewSchema } from "@/lib/validators";
import { ok, created, badRequest, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return badRequest("productId is required");

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(reviews);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const { productId, ...rest } = body;

  if (!productId) return badRequest("productId is required");
  const input = validate(CreateReviewSchema, rest);

  const review = await prisma.review.create({
    data: { ...input, productId, userId: auth.userId },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });

  return created(review);
});
