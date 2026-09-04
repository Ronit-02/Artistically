import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sellerOrderUpdateMany: vi.fn(),
  digitalDeliveryUpdateMany: vi.fn(),
  orderFindFirst: vi.fn(),
  orderItemFindFirst: vi.fn(),
  sellerOrderFindFirst: vi.fn(),
  disputeFindFirst: vi.fn(),
  transaction: vi.fn(),
  disputeCreate: vi.fn(),
  deliveryRecordCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sellerOrder: { updateMany: mocks.sellerOrderUpdateMany, findFirst: mocks.sellerOrderFindFirst },
    digitalDelivery: { updateMany: mocks.digitalDeliveryUpdateMany },
    order: { findFirst: mocks.orderFindFirst },
    orderItem: { findFirst: mocks.orderItemFindFirst },
    dispute: { findFirst: mocks.disputeFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { postPurchaseService } from "@/lib/services/post-purchase.service";

describe("post-purchase service boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sellerOrderUpdateMany.mockResolvedValue({ count: 2 });
    mocks.orderFindFirst.mockResolvedValue({ id: "order-1", status: "DELIVERED" });
    mocks.orderItemFindFirst.mockResolvedValue({ id: "item-1" });
    mocks.sellerOrderFindFirst.mockResolvedValue({ id: "seller-order-1" });
    mocks.disputeFindFirst.mockResolvedValue(null);
    mocks.disputeCreate.mockResolvedValue({ id: "dispute-1", status: "OPEN" });
    mocks.deliveryRecordCreate.mockResolvedValue({});
    mocks.digitalDeliveryUpdateMany.mockResolvedValue({ count: 3 });
    mocks.transaction.mockImplementation(async (input: unknown) => {
      if (Array.isArray(input)) return Promise.all(input);
      return (input as (tx: unknown) => unknown)({
        dispute: { create: mocks.disputeCreate },
        deliveryRecord: { create: mocks.deliveryRecordCreate },
      });
    });
  });

  it("marks only processing seller orders whose deadline has passed", async () => {
    const now = new Date("2026-08-25T12:00:00.000Z");
    await postPurchaseService.markLateSellerOrders(now);
    expect(mocks.sellerOrderUpdateMany).toHaveBeenCalledWith({
      where: { status: "PROCESSING", processingDueAt: { lt: now }, lateAt: null },
      data: { lateAt: now },
    });
  });

  it("reconciles expired digital deliveries and late seller orders together", async () => {
    const now = new Date("2026-08-25T12:00:00.000Z");
    const result = await postPurchaseService.reconcileFulfillment(now);
    expect(mocks.digitalDeliveryUpdateMany).toHaveBeenCalledWith({
      where: { status: { in: ["AVAILABLE", "DOWNLOADED"] }, expiresAt: { lt: now } },
      data: { status: "EXPIRED" },
    });
    expect(result).toEqual({ expiredDigitalDeliveries: 3, lateSellerOrders: 2 });
  });

  it("rejects dispute references that do not belong to the order", async () => {
    mocks.orderItemFindFirst.mockResolvedValue(null);
    await expect(postPurchaseService.openDispute("order-1", "buyer-1", {
      type: "DAMAGE",
      reason: "The artwork arrived damaged in transit.",
      orderItemId: "item-other-order",
    })).rejects.toThrow("Order item does not belong to this order");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("records a dispute only after validating its order references", async () => {
    await postPurchaseService.openDispute("order-1", "buyer-1", {
      type: "NON_DELIVERY",
      reason: "The promised delivery date passed and the artwork has not arrived.",
      orderItemId: "item-1",
      sellerOrderId: "seller-order-1",
    });
    expect(mocks.disputeCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ orderId: "order-1", orderItemId: "item-1", sellerOrderId: "seller-order-1" }) }));
    expect(mocks.deliveryRecordCreate).toHaveBeenCalled();
  });
});
