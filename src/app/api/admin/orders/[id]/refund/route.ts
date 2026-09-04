// POST /api/admin/orders/[id]/refund — create an idempotent Stripe refund

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, CreateRefundSchema, RouteIdSchema } from "@/lib/validators";
import { paymentService } from "@/lib/services/payment.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const input = validate(CreateRefundSchema, await req.json());
  return ok(await paymentService.createRefund(orderId, input));
});
