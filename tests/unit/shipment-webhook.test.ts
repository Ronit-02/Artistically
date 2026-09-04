import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ handleProviderEvent: vi.fn() }));
vi.mock("@/lib/services/shipment.service", () => ({ shipmentService: { handleProviderEvent: mocks.handleProviderEvent } }));

import { POST } from "@/app/api/webhooks/shipment/route";

const secret = "shipment-webhook-secret";
const body = JSON.stringify({
  eventId: "shipment-event-1",
  sellerOrderId: "cm7q1k8l90000abcde1234567",
  status: "IN_TRANSIT",
  occurredAt: "2026-08-25T10:00:00.000Z",
});

function signature(payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

describe("shipment provider webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SHIPMENT_WEBHOOK_SECRET = secret;
    mocks.handleProviderEvent.mockResolvedValue({ handled: true, reason: "processed" });
  });

  it("verifies the raw payload before dispatching the event", async () => {
    const response = await POST(new NextRequest("https://artistically.example/api/webhooks/shipment", {
      method: "POST",
      body,
      headers: { "x-shipment-signature": signature(body) },
    }));

    expect(response.status).toBe(200);
    expect(mocks.handleProviderEvent).toHaveBeenCalledWith({
      eventId: "shipment-event-1",
      sellerOrderId: "cm7q1k8l90000abcde1234567",
      status: "IN_TRANSIT",
      occurredAt: new Date("2026-08-25T10:00:00.000Z"),
    });
  });

  it("rejects an invalid signature", async () => {
    const response = await POST(new NextRequest("https://artistically.example/api/webhooks/shipment", {
      method: "POST",
      body,
      headers: { "x-shipment-signature": "00" },
    }));

    expect(response.status).toBe(400);
    expect(mocks.handleProviderEvent).not.toHaveBeenCalled();
  });
});
