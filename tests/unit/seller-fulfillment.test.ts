import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn(), updateSellerItemStatus: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));
vi.mock("@/lib/services/order.service", () => ({ orderService: { updateSellerItemStatus: mocks.updateSellerItemStatus } }));

import { PATCH } from "@/app/api/artist/order-items/[id]/route";

const itemId = "cmabcdefghijklmnopqrstuvwx";

describe("seller fulfillment route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-1", role: "ARTIST" });
    mocks.updateSellerItemStatus.mockResolvedValue({ id: itemId, fulfillmentStatus: "SHIPPED" });
  });

  it("advances a seller-owned item status", async () => {
    const response = await PATCH(
      new NextRequest(`https://artistically.example/api/artist/order-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SHIPPED" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: itemId }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.updateSellerItemStatus).toHaveBeenCalledWith(itemId, "artist-1", "SHIPPED");
  });

  it("does not expose another seller’s item", async () => {
    mocks.updateSellerItemStatus.mockResolvedValue(null);
    const response = await PATCH(
      new NextRequest(`https://artistically.example/api/artist/order-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SHIPPED" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: itemId }) },
    );

    expect(response.status).toBe(404);
  });
});
