import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  reconcileFulfillment: vi.fn(),
  fulfillmentCronSecret: "a".repeat(32),
}));

vi.mock("@/lib/env", () => ({ serverEnv: { FULFILLMENT_CRON_SECRET: mocks.fulfillmentCronSecret } }));
vi.mock("@/lib/services/post-purchase.service", () => ({ postPurchaseService: { reconcileFulfillment: mocks.reconcileFulfillment } }));

import { POST } from "@/app/api/internal/fulfillment/reconcile/route";

describe("fulfillment reconciliation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reconcileFulfillment.mockResolvedValue({ expiredDigitalDeliveries: 1, lateSellerOrders: 2 });
  });

  it("requires the configured bearer secret", async () => {
    const response = await POST(new NextRequest("https://artistically.example/api/internal/fulfillment/reconcile"));
    expect(response.status).toBe(403);
    expect(mocks.reconcileFulfillment).not.toHaveBeenCalled();
  });

  it("reconciles deadlines and expirations for a scheduler", async () => {
    const response = await POST(new NextRequest("https://artistically.example/api/internal/fulfillment/reconcile", { headers: { authorization: `Bearer ${mocks.fulfillmentCronSecret}` } }));
    expect(response.status).toBe(200);
    expect(mocks.reconcileFulfillment).toHaveBeenCalledOnce();
  });
});
