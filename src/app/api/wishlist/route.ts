// GET    /api/wishlist                      — get user's wishlist
// POST   /api/wishlist                      — add product
// DELETE /api/wishlist/[productId]          — remove product
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ok, created, noContent, notFound, conflict, withErrorHandler } from "@/lib/api-response";

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
  const { productId } = await req.json();

  if (!productId) {
    const { badRequest } = await import("@/lib/api-response");
    return badRequest("productId is required");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");

  const item = await prisma.wishlistItem.create({
    data: { userId: auth.userId, productId },
    select: wishlistSelect,
  });

  return created(item);
});
