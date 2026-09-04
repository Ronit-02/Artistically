// GET  /api/orders  — list user's orders
// POST /api/orders  — retired; orders are created by verified checkout events
import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { conflict, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const orders = await orderService.listForUser(auth.userId);
  return ok(orders);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  await requireAuth(req);
  return conflict("Orders are created after verified payment checkout; use /api/checkout/session");
});
