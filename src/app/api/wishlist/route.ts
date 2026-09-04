// GET    /api/wishlist                      — get user's wishlist
// POST   /api/wishlist                      — add product
// DELETE /api/wishlist/[productId]          — remove product
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, ProductIdSchema } from "@/lib/validators";
import { ok, created, notFound, withErrorHandler } from "@/lib/api-response";

const wishlistSelect = {
  id: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
      discount: true,
      category: true,
      badge: true,
      images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      artist: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  },
};

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const items = await prisma.wishlistItem.findMany({
    where: { userId: auth.userId },
    select: wishlistSelect,
    orderBy: { createdAt: "desc" },
  });
  return ok(items);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const validProductId = validate(ProductIdSchema, body).productId;

  const product = await prisma.product.findUnique({ where: { id: validProductId } });
  if (!product) return notFound("Product not found");

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: auth.userId, productId: validProductId } },
    select: wishlistSelect,
  });
  if (existing) return ok(existing);

  const item = await prisma.wishlistItem.create({
    data: { userId: auth.userId, productId: validProductId },
    select: wishlistSelect,
  });

  return created(item);
});
