// GET    /api/orders/[id]  — single order
// DELETE /api/orders/[id]  — cancel order
import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema } from "@/lib/validators";
import { ok, noContent, notFound, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const validId = validate(RouteIdSchema, { id }).id;
  const order = await orderService.getById(validId, auth.userId);
  if (!order) return notFound("Order not found");
  return ok(order);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const validId = validate(RouteIdSchema, { id }).id;

  const cancelled = await orderService.cancel(validId, auth.userId);
  if (!cancelled) return notFound("Order not found");
  return noContent();
});
