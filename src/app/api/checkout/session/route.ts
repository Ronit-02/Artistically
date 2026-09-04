// POST /api/checkout/session — create an idempotent Stripe-hosted payment session

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { created, withErrorHandler } from "@/lib/api-response";
import { validate, CreateCheckoutSessionSchema } from "@/lib/validators";
import { paymentService } from "@/lib/services/payment.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const input = validate(CreateCheckoutSessionSchema, await req.json());
  return created(await paymentService.createCheckoutSession(auth.userId, input));
});
