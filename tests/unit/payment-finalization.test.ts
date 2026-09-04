import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  constructEvent: vi.fn(),
  checkoutFindUnique: vi.fn(),
  paymentEventCreate: vi.fn(),
  checkoutUpdate: vi.fn(),
  paymentUpdate: vi.fn(),
  orderCreate: vi.fn(),
  orderItemFindMany: vi.fn(),
  sellerOrderCreate: vi.fn(),
  platformFeeCreate: vi.fn(),
  productUpdateMany: vi.fn(),
  cartDeleteMany: vi.fn(),
  deliveryRecordCreate: vi.fn(),
  paymentReconciliationCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    webhooks = { constructEvent: mocks.constructEvent };
  },
}));

import { paymentService } from "@/lib/services/payment.service";

const checkout = {
  id: "checkout-1",
  userId: "buyer-1",
  shippingAddress: "12 Gallery Road, Mumbai, India",
  promoCode: null,
  quoteSnapshot: {
    items: [{ productId: "product-1", quantity: 1, size: "5×7", unitPrice: 100000 }],
    subtotal: 100000,
    shippingCost: 20000,
    tax: 12000,
    discount: 0,
    total: 132000,
    promoCode: null,
  },
  payment: { id: "payment-1", amount: 132000, currency: "inr", orderId: null },
};

function transactionClient() {
  return {
    checkoutSession: { findUnique: mocks.checkoutFindUnique, update: mocks.checkoutUpdate },
    paymentEvent: { create: mocks.paymentEventCreate },
    payment: { update: mocks.paymentUpdate },
    order: { create: mocks.orderCreate },
    orderItem: { findMany: mocks.orderItemFindMany },
    sellerOrder: { create: mocks.sellerOrderCreate },
    platformFee: { create: mocks.platformFeeCreate },
    product: { updateMany: mocks.productUpdateMany },
    cartItem: { deleteMany: mocks.cartDeleteMany },
    deliveryRecord: { create: mocks.deliveryRecordCreate },
    paymentReconciliation: { create: mocks.paymentReconciliationCreate },
  };
}

describe("payment order finalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_artistically";
    mocks.transaction.mockImplementation(async (callback: (tx: ReturnType<typeof transactionClient>) => unknown) => callback(transactionClient()));
    mocks.checkoutFindUnique.mockResolvedValue(checkout);
    mocks.paymentEventCreate.mockResolvedValue({});
    mocks.checkoutUpdate.mockResolvedValue({});
    mocks.paymentUpdate.mockResolvedValue({});
    mocks.orderCreate.mockResolvedValue({ id: "order-1" });
    mocks.orderItemFindMany.mockResolvedValue([
      { id: "order-item-1", quantity: 1, price: 100000, product: { artistId: "artist-1" } },
    ]);
    mocks.sellerOrderCreate.mockResolvedValue({ id: "seller-order-1" });
    mocks.platformFeeCreate.mockResolvedValue({ id: "platform-fee-1" });
    mocks.productUpdateMany.mockResolvedValue({ count: 1 });
    mocks.cartDeleteMany.mockResolvedValue({ count: 1 });
    mocks.constructEvent.mockReturnValue({
      id: "evt_completed",
      type: "checkout.session.completed",
      data: { object: { metadata: { checkout_session_id: "checkout-1" }, payment_intent: "pi_1", amount_total: 132000, currency: "inr" } },
    });
  });

  it("creates and links an order only after a successful payment event", async () => {
    await paymentService.handleWebhook("{\"id\":\"evt_completed\"}", "t=1,v1=signature");

    expect(mocks.orderCreate).toHaveBeenCalledOnce();
    expect(mocks.platformFeeCreate).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        sellerOrderId: "seller-order-1",
        amount: 10000,
        currency: "inr",
        description: "Artistically platform commission (10%)",
      },
    });
    expect(mocks.productUpdateMany).toHaveBeenCalledWith({
      where: { id: "product-1", isActive: true, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
    expect(mocks.cartDeleteMany).toHaveBeenCalledWith({ where: { userId: "buyer-1" } });
    expect(mocks.paymentUpdate).toHaveBeenLastCalledWith({
      where: { id: "payment-1" },
      data: { orderId: "order-1" },
    });
    expect(mocks.paymentReconciliationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "payment-1",
        orderId: "order-1",
        capturedAmount: 132000,
        sellerAllocatedAmount: 120000,
        taxAmount: 12000,
        discountAmount: 0,
        platformFeeAmount: 10000,
        status: "RECONCILED",
      }),
    });
  });

  it("rejects a successful Stripe event whose captured amount or currency differs", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_tampered_amount",
      type: "checkout.session.completed",
      data: { object: { metadata: { checkout_session_id: "checkout-1" }, payment_intent: "pi_1", amount_total: 132001, currency: "inr" } },
    });

    await expect(paymentService.handleWebhook("{\"id\":\"evt_tampered_amount\"}", "t=1,v1=signature"))
      .rejects.toThrow("Stripe payment amount does not match the checkout quote");
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });

  it("does not create a second order when a later success event retries the payment", async () => {
    mocks.checkoutFindUnique.mockResolvedValue({
      ...checkout,
      payment: { ...checkout.payment, orderId: "order-1" },
    });

    await paymentService.handleWebhook("{\"id\":\"evt_completed\"}", "t=1,v1=signature");

    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.productUpdateMany).not.toHaveBeenCalled();
    expect(mocks.cartDeleteMany).not.toHaveBeenCalled();
  });

  it("does not create an order for a failed asynchronous payment", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_failed",
      type: "checkout.session.async_payment_failed",
      data: { object: { metadata: { checkout_session_id: "checkout-1" } } },
    });

    await paymentService.handleWebhook("{\"id\":\"evt_failed\"}", "t=1,v1=signature");

    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.productUpdateMany).not.toHaveBeenCalled();
    expect(mocks.checkoutUpdate).toHaveBeenCalledWith({
      where: { id: "checkout-1" },
      data: { status: "FAILED" },
    });
  });

  it("marks an expired checkout failed without creating an order", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_expired",
      type: "checkout.session.expired",
      data: { object: { metadata: { checkout_session_id: "checkout-1" } } },
    });

    await paymentService.handleWebhook("{\"id\":\"evt_expired\"}", "t=1,v1=signature");

    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.checkoutUpdate).toHaveBeenCalledWith({
      where: { id: "checkout-1" },
      data: { status: "FAILED" },
    });
    expect(mocks.paymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { status: "FAILED", stripePaymentId: undefined },
    });
  });

  it("does not downgrade an already-finalized payment on a late failure event", async () => {
    mocks.checkoutFindUnique.mockResolvedValue({
      ...checkout,
      payment: { ...checkout.payment, orderId: "order-1" },
    });
    mocks.constructEvent.mockReturnValue({
      id: "evt_late_failure",
      type: "checkout.session.async_payment_failed",
      data: { object: { metadata: { checkout_session_id: "checkout-1" } } },
    });

    await paymentService.handleWebhook("{\"id\":\"evt_late_failure\"}", "t=1,v1=signature");

    expect(mocks.checkoutUpdate).not.toHaveBeenCalled();
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });
});
