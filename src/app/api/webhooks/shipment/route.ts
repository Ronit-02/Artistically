// POST /api/webhooks/shipment — signed shipment-provider event receiver

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { ok, withErrorHandler } from "@/lib/api-response";
import { InvalidStateError } from "@/lib/domain-errors";
import { validate, ShipmentProviderEventSchema } from "@/lib/validators";
import { shipmentService } from "@/lib/services/shipment.service";

function verifySignature(payload: string, signature: string | null) {
  const secret = process.env.SHIPMENT_WEBHOOK_SECRET;
  if (!secret || !signature) throw new InvalidStateError("Shipment webhook is not configured");
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const provided = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) {
    throw new InvalidStateError("Invalid shipment webhook signature");
  }
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const payload = await req.text();
  verifySignature(payload, req.headers.get("x-shipment-signature"));
  const input = validate(ShipmentProviderEventSchema, JSON.parse(payload));
  return ok(await shipmentService.handleProviderEvent({ ...input, occurredAt: new Date(input.occurredAt) }));
});
