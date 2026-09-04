// POST /api/checkout/webhook — Stripe payment event receiver

import { NextRequest } from "next/server";
import { ok, withErrorHandler } from "@/lib/api-response";
import { paymentService } from "@/lib/services/payment.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const result = await paymentService.handleWebhook(await req.text(), req.headers.get("stripe-signature"));
  return ok(result);
});
