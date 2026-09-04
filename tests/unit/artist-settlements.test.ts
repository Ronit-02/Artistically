import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  sellerOrderFindMany: vi.fn(),
  payoutFindMany: vi.fn(),
  sellerSettlementFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    sellerOrder: { findMany: mocks.sellerOrderFindMany },
    payout: { findMany: mocks.payoutFindMany },
    sellerSettlement: { findMany: mocks.sellerSettlementFindMany },
  },
}));

import { orderService } from "@/lib/services/order.service";

describe("artist settlement reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.artistFindUnique.mockResolvedValue({ id: "artist-1" });
    mocks.sellerOrderFindMany.mockResolvedValue([
      {
        id: "seller-order-1",
        orderId: "order-1",
        status: "PROCESSING",
        createdAt: new Date("2026-08-25T00:00:00.000Z"),
        subtotal: 100000,
        shippingCost: 20000,
        platformFees: [{ amount: 10000, currency: "inr" }],
      },
    ]);
    mocks.payoutFindMany.mockResolvedValue([
      { id: "payout-1", status: "PAID", amount: 110000, currency: "inr", availableAt: new Date("2026-08-26T00:00:00.000Z"), paidAt: new Date("2026-08-27T00:00:00.000Z") },
    ]);
    mocks.sellerSettlementFindMany.mockResolvedValue([]);
  });

  it("maps seller allocation records and payout lifecycle data without exposing provider rows", async () => {
    const result = await orderService.listSettlementsForArtist("artist-user-1");

    expect(result).toEqual({
      sellerOrders: [{
        id: "seller-order-1",
        orderId: "order-1",
        status: "PROCESSING",
        createdAt: "2026-08-25T00:00:00.000Z",
        grossArtworkAmountMinor: 100000,
        shippingAmountMinor: 20000,
        platformFeeAmountMinor: 10000,
        netAllocatedAmountMinor: 110000,
        currency: "inr",
      }],
      payouts: [{
        id: "payout-1",
        status: "PAID",
        amountMinor: 110000,
        currency: "inr",
        availableAt: "2026-08-26T00:00:00.000Z",
        paidAt: "2026-08-27T00:00:00.000Z",
      }],
      settlements: [],
      statement: {
        currency: "inr",
        grossAmountMinor: 0,
        shippingAmountMinor: 0,
        platformFeeAmountMinor: 0,
        refundAmountMinor: 0,
        netAmountMinor: 0,
        transferredAmountMinor: 0,
        outstandingAmountMinor: 0,
        status: "RECONCILED",
      },
    });
  });

  it("returns empty settlement collections for a user without an artist profile", async () => {
    mocks.artistFindUnique.mockResolvedValue(null);

    await expect(orderService.listSettlementsForArtist("collector-1")).resolves.toEqual({ sellerOrders: [], payouts: [] });
    expect(mocks.sellerOrderFindMany).not.toHaveBeenCalled();
    expect(mocks.payoutFindMany).not.toHaveBeenCalled();
  });
});
