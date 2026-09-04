import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkoutFindUnique: vi.fn(),
  checkoutCreate: vi.fn(),
  checkoutUpdate: vi.fn(),
  cartFindMany: vi.fn(),
  quote: vi.fn(),
  stripeCreate: vi.fn(),
  stripeRetrieve: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    checkoutSession: { findUnique: mocks.checkoutFindUnique, create: mocks.checkoutCreate, update: mocks.checkoutUpdate },
    cartItem: { findMany: mocks.cartFindMany },
  },
}));

vi.mock("@/lib/services/order.service", () => ({ orderService: { quote: mocks.quote } }));

vi.mock("stripe", () => ({
  default: class Stripe {
    checkout = { sessions: { create: mocks.stripeCreate, retrieve: mocks.stripeRetrieve } };
  },
}));

import { paymentService } from "@/lib/services/payment.service";

describe("checkout idempotency under concurrent requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    mocks.quote.mockResolvedValue({
      items: [{ productId: "product-1", quantity: 1, size: "5×7", unitPrice: 100000, stock: 1, available: true }],
      subtotal: 100000,
      shippingCost: 20000,
      tax: 12000,
      discount: 0,
      total: 132000,
      promoCode: null,
      canCheckout: true,
    });
    mocks.cartFindMany.mockResolvedValue([{ quantity: 1, product: { price: 100000, title: "Blue Work" } }]);
    mocks.stripeCreate.mockResolvedValue({ id: "cs_1", url: "https://checkout.stripe.test/cs_1" });
    mocks.stripeRetrieve.mockResolvedValue({ id: "cs_1", url: "https://checkout.stripe.test/cs_1" });
    mocks.checkoutFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "checkout-1", status: "PENDING", stripeSessionId: null });
    mocks.checkoutCreate
      .mockResolvedValueOnce({ id: "checkout-1", status: "PENDING" })
      .mockRejectedValueOnce(Object.assign(new Error("unique constraint"), { code: "P2002" }));
    mocks.checkoutUpdate.mockResolvedValue({});
  });

  it("creates one durable checkout row and one Stripe session for concurrent identical requests", async () => {
    const results = await Promise.all([
      paymentService.createCheckoutSession("buyer-1", { shippingAddress: "12 Gallery Road, Mumbai", idempotencyKey: "same-key-001" }),
      paymentService.createCheckoutSession("buyer-1", { shippingAddress: "12 Gallery Road, Mumbai", idempotencyKey: "same-key-001" }),
    ]);

    // The unique constraint is the database race winner; only one create succeeds.
    expect(mocks.checkoutCreate).toHaveBeenCalledTimes(2);
    expect(mocks.stripeCreate).toHaveBeenCalledOnce();
    const stripeInput = mocks.stripeCreate.mock.calls[0][0] as { line_items: Array<{ quantity: number; price_data: { unit_amount: number } }> };
    expect(stripeInput.line_items.reduce((sum, item) => sum + item.quantity * item.price_data.unit_amount, 0)).toBe(132000);
    expect(results).toHaveLength(2);
    expect(results).toEqual(expect.arrayContaining([
      { id: "checkout-1", status: "PENDING", url: "https://checkout.stripe.test/cs_1" },
      { id: "checkout-1", status: "PENDING", url: null },
    ]));
  });
});
