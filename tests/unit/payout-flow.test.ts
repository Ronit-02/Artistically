import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  sellerOrderFindUnique: vi.fn(),
  sellerSettlementCreate: vi.fn(),
  sellerSettlementAggregate: vi.fn(),
  sellerSettlementUpdate: vi.fn(),
  stripeTransferCreate: vi.fn(),
  stripePayoutCreate: vi.fn(),
  payoutUpsert: vi.fn(),
  payoutAggregate: vi.fn(),
  transferFindFirst: vi.fn(),
  transferUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    sellerOrder: { findUnique: mocks.sellerOrderFindUnique },
    sellerSettlement: { create: mocks.sellerSettlementCreate, aggregate: mocks.sellerSettlementAggregate, update: mocks.sellerSettlementUpdate },
    payout: { upsert: mocks.payoutUpsert, aggregate: mocks.payoutAggregate },
    stripeTransfer: { findFirst: mocks.transferFindFirst },
    $transaction: mocks.transaction,
  },
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    transfers = { create: mocks.stripeTransferCreate };
    payouts = { create: mocks.stripePayoutCreate };
    accounts = { create: vi.fn() };
    accountLinks = { create: vi.fn() };
  },
}));

import { connectService } from "@/lib/services/connect.service";

describe("seller payout flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    mocks.artistFindUnique.mockResolvedValue({ id: "artist-1", stripeAccount: { stripeAccountId: "acct_1", status: "ACTIVE", payoutsEnabled: true } });
    mocks.sellerSettlementAggregate.mockResolvedValue({ _sum: { netAmount: 120000, refundAmount: 0, transferredAmount: 120000 } });
    mocks.payoutAggregate.mockResolvedValue({ _sum: { amount: 0 } });
    mocks.stripePayoutCreate.mockResolvedValue({ id: "po_1", amount: 120000, currency: "inr", arrival_date: 1787654400 });
    mocks.payoutUpsert.mockResolvedValue({ id: "payout-1", status: "PENDING", amount: 120000, currency: "inr", availableAt: new Date("2026-08-25T00:00:00.000Z"), paidAt: null, stripePayoutId: "po_1" });
    mocks.sellerOrderFindUnique.mockResolvedValue({
      id: "seller-order-1",
      artistId: "artist-1",
      total: 120000,
      artist: { userId: "artist-user-1", stripeAccount: { stripeAccountId: "acct_1", status: "ACTIVE", payoutsEnabled: true } },
      platformFees: [{ amount: 10000, currency: "inr" }],
      settlement: { id: "settlement-1", netAmount: 110000, refundAmount: 0 },
      transfers: [],
    });
    mocks.stripeTransferCreate.mockResolvedValue({ id: "tr_1", balance_transaction: "txn_1" });
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      stripeTransfer: { upsert: vi.fn().mockResolvedValue({ id: "transfer-1", status: "CREATED", amount: 110000 }) },
      sellerSettlement: { update: mocks.sellerSettlementUpdate },
    }));
    mocks.sellerSettlementUpdate.mockResolvedValue({});
  });

  it("creates an idempotent Connect transfer for the reconciled seller amount", async () => {
    const transfer = await connectService.createTransferForSellerOrder("seller-order-1");

    expect(mocks.stripeTransferCreate).toHaveBeenCalledWith({
      amount: 110000,
      currency: "inr",
      destination: "acct_1",
      metadata: { artistically_settlement_id: "settlement-1", seller_order_id: "seller-order-1" },
    }, { idempotencyKey: "seller-transfer:settlement-1" });
    expect(transfer).toMatchObject({ status: "CREATED", amount: 110000 });
  });

  it("creates a connected-account payout only within the available seller balance", async () => {
    const payout = await connectService.createPayoutForArtist("artist-user-1", { amountMinor: 120000, idempotencyKey: "payout-request-1" });

    expect(mocks.stripePayoutCreate).toHaveBeenCalledWith({ amount: 120000, currency: "inr", metadata: { artist_id: "artist-1" } }, { stripeAccount: "acct_1", idempotencyKey: "artist-payout:payout-request-1" });
    expect(payout).toMatchObject({ status: "PENDING", stripePayoutId: "po_1" });
  });

  it("does not count an already-created payout as available balance", async () => {
    mocks.sellerSettlementAggregate.mockResolvedValue({ _sum: { netAmount: 120000, refundAmount: 0, transferredAmount: 120000 } });
    mocks.payoutAggregate.mockResolvedValue({ _sum: { amount: 120000 } });

    await expect(connectService.createPayoutForArtist("artist-user-1", { amountMinor: 1, idempotencyKey: "payout-request-2" })).rejects.toThrow("available seller balance");
    expect(mocks.stripePayoutCreate).not.toHaveBeenCalled();
  });

  it("marks a reversed transfer out of balance", async () => {
    mocks.transferFindFirst.mockResolvedValue({ id: "transfer-1", settlementId: "settlement-1", status: "CREATED", amount: 110000 });
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      stripeTransfer: { update: mocks.transferUpdate },
      sellerSettlement: { update: mocks.sellerSettlementUpdate },
    }));
    mocks.transferUpdate.mockResolvedValue({ id: "transfer-1", status: "REVERSED", reversedAmount: 110000 });

    await expect(connectService.handleTransferEvent("transfer.reversed", { id: "tr_1", amount_reversed: 110000, metadata: {} } as never)).resolves.toMatchObject({ updated: true });
    expect(mocks.sellerSettlementUpdate).toHaveBeenCalledWith({ where: { id: "settlement-1" }, data: { status: "OUT_OF_BALANCE", reconciledAt: expect.any(Date) } });
  });
});
