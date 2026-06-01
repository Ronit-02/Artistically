// DELETE /api/wishlist/[productId]
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { noContent, notFound, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ productId: string }> };

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { productId } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);

  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: auth.userId, productId } },
  });

  if (!item) return notFound("Item not in wishlist");

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId: auth.userId, productId } },
  });

  return noContent();
});
