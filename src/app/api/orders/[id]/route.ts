// GET    /api/orders/[id]  — single order
// DELETE /api/orders/[id]  — cancel order
import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { ok, noContent, notFound, badRequest, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const order = await orderService.getById(id, auth.userId);
  if (!order) return notFound("Order not found");
  return ok(order);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);

  try {
    const cancelled = await orderService.cancel(id, auth.userId);
    if (!cancelled) return notFound("Order not found");
    return noContent();
  } catch (err) {
    return badRequest((err as Error).message);
  }
});
