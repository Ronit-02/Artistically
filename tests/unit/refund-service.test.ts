import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refundFindUnique: vi.fn(),
  refundCreate: vi.fn(),
  refundUpdate: vi.fn(),
  orderFindUnique: vi.fn(),
  transaction: vi.fn(),
  stripeRefundCreate: vi.fn(),
  paymentUpdate: vi.fn(),
  orderUpdate: vi.fn(),
  productUpdate: vi.fn(),
  orderItemUpdate: vi.fn(),
  deliveryRecordCreate: vi.fn(),
  reconciliationUpdateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    refund: { findUnique: mocks.refundFindUnique, create: mocks.refundCreate, update: mocks.refundUpdate },
    order: { findUnique: mocks.orderFindUnique },
    $transaction: mocks.transaction,
  },
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    refunds = { create: mocks.stripeRefundCreate };
  },
}));

import { paymentService } from "@/lib/services/payment.service";

const order = {
  id: "order-1",
  status: "PROCESSING",
  total: 132000,
  payment: { id: "payment-1", status: "SUCCEEDED", stripePaymentId: "pi_1", amount: 132000, currency: "inr" },
  refunds: [],
  items: [{ id: "order-item-1", productId: "product-1", quantity: 1, fulfillmentStatus: "PENDING" }],
};

function transactionClient() {
  return {
    refund: { update: mocks.refundUpdate },
    payment: { update: mocks.paymentUpdate },
    order: { update: mocks.orderUpdate },
    product: { update: mocks.productUpdate },
    orderItem: { update: mocks.orderItemUpdate },
    deliveryRecord: { create: mocks.deliveryRecordCreate },
    paymentReconciliation: { updateMany: mocks.reconciliationUpdateMany },
  };
}

describe("payment refund service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    mocks.refundFindUnique.mockResolvedValue(null);
    mocks.orderFindUnique.mockResolvedValue(order);
    mocks.refundCreate.mockResolvedValue({ id: "refund-1", status: "PENDING", amount: 132000, currency: "inr", stripeRefundId: null });
    mocks.stripeRefundCreate.mockResolvedValue({ id: "re_1" });
    mocks.refundUpdate.mockResolvedValue({ id: "refund-1", status: "SUCCEEDED", amount: 132000, currency: "inr", stripeRefundId: "re_1" });
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.productUpdate.mockResolvedValue({});
    mocks.orderItemUpdate.mockResolvedValue({});
    mocks.reconciliationUpdateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation(async (callback: (tx: ReturnType<typeof transactionClient>) => unknown) => callback(transactionClient()));
  });

  it("creates an idempotent full refund and restores unfulfilled stock", async () => {
    const result = await paymentService.createRefund("order-1", { idempotencyKey: "refund-001" });

    expect(mocks.stripeRefundCreate).toHaveBeenCalledWith(
      {
        payment_intent: "pi_1",
        amount: 132000,
        metadata: { artistically_refund_id: "refund-1", order_id: "order-1" },
      },
      { idempotencyKey: "refund:refund-001" },
    );
    expect(mocks.orderUpdate).toHaveBeenCalledWith({ where: { id: "order-1" }, data: { status: "REFUNDED" } });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith({ where: { id: "payment-1" }, data: { status: "REFUNDED" } });
    expect(mocks.productUpdate).toHaveBeenCalledWith({ where: { id: "product-1" }, data: { stock: { increment: 1 } } });
    expect(result).toMatchObject({ status: "SUCCEEDED", stripeRefundId: "re_1" });
  });

  it("rejects a refund larger than the remaining captured amount", async () => {
    await expect(paymentService.createRefund("order-1", { amountMinor: 132001, idempotencyKey: "refund-002" }))
      .rejects.toThrow("Refund amount exceeds the remaining captured payment");
    expect(mocks.refundCreate).not.toHaveBeenCalled();
    expect(mocks.stripeRefundCreate).not.toHaveBeenCalled();
  });

  it("returns a durable success without calling Stripe again for a retried key", async () => {
    mocks.refundFindUnique.mockResolvedValue({ id: "refund-1", status: "SUCCEEDED", amount: 132000, currency: "inr", stripeRefundId: "re_1" });

    await paymentService.createRefund("order-1", { idempotencyKey: "refund-001" });

    expect(mocks.orderFindUnique).not.toHaveBeenCalled();
    expect(mocks.stripeRefundCreate).not.toHaveBeenCalled();
  });
});
