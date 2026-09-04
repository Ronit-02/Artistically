// POST /api/checkout/quote — calculate a current cart quote without creating an order

import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { validate, CheckoutQuoteSchema } from "@/lib/validators";
import { ok, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const input = validate(CheckoutQuoteSchema, await req.json());
  return ok(await orderService.quote(auth.userId, input.promoCode));
});
