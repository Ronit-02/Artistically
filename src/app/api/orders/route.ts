// GET  /api/orders  — list user's orders
// POST /api/orders  — checkout (create order from cart)
import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { validate, CreateOrderSchema } from "@/lib/validators";
import { ok, created, badRequest, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const orders = await orderService.listForUser(auth.userId);
  return ok(orders);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const input = validate(CreateOrderSchema, body);

  try {
    const order = await orderService.checkout(
      auth.userId,
      input.shippingAddress,
      input.promoCode
    );
    return created(order);
  } catch (err) {
    return badRequest((err as Error).message);
  }
});
