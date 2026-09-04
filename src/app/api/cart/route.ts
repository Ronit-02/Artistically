// GET    /api/cart             — get current user's cart
// POST   /api/cart             — add item to cart
// DELETE /api/cart             — clear entire cart
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, AddToCartSchema } from "@/lib/validators";
import { ok, created, noContent, notFound, badRequest, withErrorHandler } from "@/lib/api-response";

const cartItemSelect = {
  id: true,
  quantity: true,
  size: true,
  product: {
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
      discount: true,
      category: true,
      badge: true,
      stock: true,
      images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      artist: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  },
};

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const items = await prisma.cartItem.findMany({
    where: { userId: auth.userId },
    select: cartItemSelect,
  });
  return ok(items);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const input = validate(AddToCartSchema, body);

  // Check product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || !product.isActive) return notFound("Product not found");
  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId_size: {
        userId: auth.userId,
        productId: input.productId,
        size: input.size,
      },
    },
    select: { quantity: true },
  });
  const requestedQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (product.stock < requestedQuantity) return badRequest("Insufficient stock");
  if (requestedQuantity > 10) return badRequest("Cart quantity cannot exceed 10");

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId_size: {
        userId: auth.userId,
        productId: input.productId,
        size: input.size,
      },
    },
    update: { quantity: { increment: input.quantity } },
    create: {
      userId: auth.userId,
      productId: input.productId,
      quantity: input.quantity,
      size: input.size,
    },
    select: cartItemSelect,
  });

  return created(item);
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  await prisma.cartItem.deleteMany({ where: { userId: auth.userId } });
  return noContent();
});
