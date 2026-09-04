import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cartFindMany: vi.fn(),
  transaction: vi.fn(),
  orderCreate: vi.fn(),
  stockUpdate: vi.fn(),
  cartDeleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cartItem: { findMany: mocks.cartFindMany },
    $transaction: mocks.transaction,
  },
}));

import { orderService } from "@/lib/services/order.service";

const cartItem = {
  productId: "product-1",
  quantity: 2,
  size: "5×7",
  product: {
    id: "product-1",
    title: "Blue Work",
    price: 10000,
    stock: 2,
    isActive: true,
  },
};

describe("checkout inventory guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cartFindMany.mockResolvedValue([cartItem]);
    mocks.orderCreate.mockResolvedValue({ id: "order-1", items: [] });
    mocks.stockUpdate.mockResolvedValue({ count: 1 });
    mocks.cartDeleteMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        order: { create: mocks.orderCreate },
        product: { updateMany: mocks.stockUpdate },
        cartItem: { deleteMany: mocks.cartDeleteMany },
      }),
    );
  });

  it("decrements only rows that still have enough stock", async () => {
    await orderService.checkout("user-1", "123 Main Street");

    expect(mocks.stockUpdate).toHaveBeenCalledWith({
      where: {
        id: "product-1",
        isActive: true,
        stock: { gte: 2 },
      },
      data: { stock: { decrement: 2 } },
    });
    expect(mocks.cartDeleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("aborts before clearing the cart when the guarded update loses a race", async () => {
    mocks.stockUpdate.mockResolvedValue({ count: 0 });

    await expect(orderService.checkout("user-1", "123 Main Street")).rejects.toThrow(
      "insufficient stock",
    );

    expect(mocks.cartDeleteMany).not.toHaveBeenCalled();
  });

  it("rejects inactive products before creating an order", async () => {
    mocks.cartFindMany.mockResolvedValue([
      { ...cartItem, product: { ...cartItem.product, isActive: false } },
    ]);

    await expect(orderService.checkout("user-1", "123 Main Street")).rejects.toThrow(
      "insufficient stock",
    );

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unknown promo codes before opening the order transaction", async () => {
    await expect(orderService.checkout("user-1", "123 Main Street", " unknown "))
      .rejects.toThrow("Promo code is invalid");

    expect(mocks.cartFindMany).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("normalizes valid promo codes in the order snapshot", async () => {
    await orderService.checkout("user-1", "123 Main Street", " art10 ");

    expect(mocks.orderCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        promoCode: "ART10",
        discount: 2000,
      }),
    }));
  });

  it("provides a non-mutating quote with current availability", async () => {
    await expect(orderService.quote("user-1", " art10 ")).resolves.toMatchObject({
      subtotal: 20000,
      shippingCost: 20000,
      tax: 2400,
      discount: 2000,
      total: 40400,
      promoCode: "ART10",
      canCheckout: true,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
