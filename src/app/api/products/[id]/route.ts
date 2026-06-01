// GET    /api/products/[id]  — single product
// PATCH  /api/products/[id]  — update (owner only)
// DELETE /api/products/[id]  — soft-delete (owner only)
import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product.service";
import { requireAuth } from "@/lib/auth";
import { validate, UpdateProductSchema } from "@/lib/validators";
import { ok, notFound, noContent, forbidden, withErrorHandler } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const product = await productService.getById(id);
  if (!product) return notFound("Product not found");
  return ok(product);
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId } });
  if (!artist) return forbidden("Artists only");

  const body = await req.json();
  const input = validate(UpdateProductSchema, body);
  const product = await productService.update(id, artist.id, input);
  if (!product) return notFound("Product not found or not yours");
  return ok(product);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId } });
  if (!artist) return forbidden("Artists only");

  const deleted = await productService.delete(id, artist.id);
  if (!deleted) return notFound("Product not found or not yours");
  return noContent();
});
