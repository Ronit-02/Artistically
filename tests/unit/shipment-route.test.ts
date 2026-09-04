import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  updateSellerShipment: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/shipment.service", () => ({
  shipmentService: { updateSellerShipment: mocks.updateSellerShipment },
}));

import { PATCH } from "@/app/api/artist/seller-orders/[id]/shipment/route";

const sellerOrderId = "cm7q1k8l90000abcde1234567";

function request(body: unknown) {
  return new NextRequest(`https://artistically.example/api/artist/seller-orders/${sellerOrderId}/shipment`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("seller shipment route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-1", role: "ARTIST" });
    mocks.updateSellerShipment.mockResolvedValue({ id: "shipment-1", status: "IN_TRANSIT" });
  });

  it("updates an owned shipment with tracking details", async () => {
    const response = await PATCH(request({
      status: "IN_TRANSIT",
      carrier: "BlueDart",
      trackingNumber: "BD123",
      trackingUrl: "https://carrier.example/BD123",
    }), { params: Promise.resolve({ id: sellerOrderId }) });

    expect(response.status).toBe(200);
    expect(mocks.updateSellerShipment).toHaveBeenCalledWith(sellerOrderId, "artist-1", {
      status: "IN_TRANSIT",
      carrier: "BlueDart",
      trackingNumber: "BD123",
      trackingUrl: "https://carrier.example/BD123",
    });
  });

  it("does not expose shipment updates to buyers", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    const response = await PATCH(request({ status: "IN_TRANSIT" }), { params: Promise.resolve({ id: sellerOrderId }) });

    expect(response.status).toBe(403);
    expect(mocks.updateSellerShipment).not.toHaveBeenCalled();
  });
});
