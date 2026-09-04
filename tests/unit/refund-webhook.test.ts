import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  constructEvent: vi.fn(),
  refundFindFirst: vi.fn(),
  refundFindMany: vi.fn(),
  refundUpdate: vi.fn(),
  paymentEventCreate: vi.fn(),
  paymentUpdate: vi.fn(),
  orderUpdate: vi.fn(),
  orderItemFindMany: vi.fn(),
  orderItemUpdateMany: vi.fn(),
  productUpdate: vi.fn(),
  reconciliationUpdateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: mocks.transaction } }));

vi.mock("stripe", () => ({
  default: class Stripe {
    webhooks = { constructEvent: mocks.constructEvent };
  },
}));

import { paymentService } from "@/lib/services/payment.service";

function transactionClient() {
  return {
    refund: { findFirst: mocks.refundFindFirst, findMany: mocks.refundFindMany, update: mocks.refundUpdate },
    paymentEvent: { create: mocks.paymentEventCreate },
    payment: { update: mocks.paymentUpdate },
    order: { update: mocks.orderUpdate },
    orderItem: { findMany: mocks.orderItemFindMany, updateMany: mocks.orderItemUpdateMany },
    product: { update: mocks.productUpdate },
    paymentReconciliation: { updateMany: mocks.reconciliationUpdateMany },
  };
}

const refund = {
  id: "refund-1",
  orderId: "order-1",
  paymentId: "payment-1",
  amount: 132000,
  status: "PENDING",
  payment: { id: "payment-1", amount: 132000 },
};

describe("refund webhook reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_artistically";
    mocks.transaction.mockImplementation(async (callback: (tx: ReturnType<typeof transactionClient>) => unknown) => callback(transactionClient()));
    mocks.constructEvent.mockReturnValue({
      id: "evt_refund_updated",
      type: "refund.updated",
      data: {
        object: {
          id: "re_1",
          status: "succeeded",
          metadata: { artistically_refund_id: "refund-1" },
        },
      },
    });
    mocks.refundFindFirst.mockResolvedValue(refund);
    mocks.paymentEventCreate.mockResolvedValue({});
    mocks.refundUpdate.mockResolvedValue({});
    mocks.refundFindMany.mockResolvedValue([{ amount: 132000 }]);
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.orderItemFindMany.mockResolvedValue([
      { id: "order-item-1", productId: "product-1", quantity: 1, fulfillmentStatus: "PROCESSING" },
    ]);
    mocks.orderItemUpdateMany.mockResolvedValue({ count: 1 });
    mocks.productUpdate.mockResolvedValue({});
    mocks.reconciliationUpdateMany.mockResolvedValue({ count: 1 });
  });

  it("reconciles a successful full refund and restores unfulfilled stock once", async () => {
    const result = await paymentService.handleWebhook("{\"id\":\"evt_refund_updated\"}", "t=1,v1=signature");

    expect(result).toEqual({ received: true, handled: true });
    expect(mocks.refundUpdate).toHaveBeenCalledWith({
      where: { id: "refund-1" },
      data: { status: "SUCCEEDED", stripeRefundId: "re_1" },
    });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith({ where: { id: "payment-1" }, data: { status: "REFUNDED" } });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({ where: { id: "order-1" }, data: { status: "REFUNDED" } });
    expect(mocks.orderItemUpdateMany).toHaveBeenCalledWith({
      where: { id: "order-item-1", fulfillmentStatus: { in: ["PENDING", "PROCESSING"] } },
      data: { fulfillmentStatus: "CANCELLED" },
    });
    expect(mocks.productUpdate).toHaveBeenCalledWith({ where: { id: "product-1" }, data: { stock: { increment: 1 } } });
  });

  it("updates a pending refund without marking the order paid or refunded", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_refund_created",
      type: "refund.created",
      data: { object: { id: "re_1", status: "pending", metadata: { artistically_refund_id: "refund-1" } } },
    });

    await paymentService.handleWebhook("{\"id\":\"evt_refund_created\"}", "t=1,v1=signature");

    expect(mocks.refundUpdate).toHaveBeenCalledWith({
      where: { id: "refund-1" },
      data: { status: "PENDING", stripeRefundId: "re_1" },
    });
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("acknowledges an unknown refund without mutating domain state", async () => {
    mocks.refundFindFirst.mockResolvedValue(null);

    const result = await paymentService.handleWebhook("{\"id\":\"evt_refund_updated\"}", "t=1,v1=signature");

    expect(result).toEqual({ received: true, handled: false });
    expect(mocks.paymentEventCreate).not.toHaveBeenCalled();
    expect(mocks.refundUpdate).not.toHaveBeenCalled();
  });
});
