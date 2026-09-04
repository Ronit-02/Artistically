// PATCH /api/cart/[itemId]   — set quantity
// DELETE /api/cart/[itemId] — remove one cart item
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema, UpdateCartItemSchema } from "@/lib/validators";
import { badRequest, noContent, notFound, ok, withErrorHandler } from "@/lib/api-response";

type Context = { params: Promise<{ itemId: string }> };

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

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { itemId } = await (ctx as Context).params;
  const validItemId = validate(RouteIdSchema, { id: itemId }).id;
  const input = validate(UpdateCartItemSchema, await req.json());
  const item = await prisma.cartItem.findFirst({
    where: { id: validItemId, userId: auth.userId },
    select: { product: { select: { stock: true } } },
  });

  if (!item) return notFound("Cart item not found");
  if (input.quantity > item.product.stock) return badRequest("Insufficient stock");

  const updated = await prisma.cartItem.update({
    where: { id: validItemId },
    data: { quantity: input.quantity },
    select: cartItemSelect,
  });

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { itemId } = await (ctx as Context).params;
  const validItemId = validate(RouteIdSchema, { id: itemId }).id;
  const item = await prisma.cartItem.findFirst({ where: { id: validItemId, userId: auth.userId } });

  if (!item) return notFound("Cart item not found");

  await prisma.cartItem.delete({ where: { id: validItemId } });
  return noContent();
});
