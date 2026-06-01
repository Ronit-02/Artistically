// ─────────────────────────────────────────────────────────────────────────────
// lib/services/order.service.ts
// Checkout logic: validate cart → create order → clear cart (transaction)
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const SHIPPING_COST = 200;
const TAX_RATE      = 0.12;
const PROMO_CODES: Record<string, number> = {
  ART10: 0.10,
  SAVE20: 0.20,
};

export const orderService = {
  async listForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
                artist: {
                  select: { user: { select: { firstName: true, lastName: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  },

  // Checkout: convert cart to order in a single transaction
  async checkout(userId: string, shippingAddress: string, promoCode?: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new Error(`"${item.product.title}" has insufficient stock`);
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const discountRate = promoCode ? (PROMO_CODES[promoCode.toUpperCase()] ?? 0) : 0;
    const discountAmount = Math.round(subtotal * discountRate);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + SHIPPING_COST + tax - discountAmount;

    // Everything in one transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress,
          promoCode,
          subtotal,
          shippingCost: SHIPPING_COST,
          tax,
          discount: discountAmount,
          total,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              price: item.product.price, // snapshot price
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Clear the cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return order;
  },

  async cancel(id: string, userId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) return false;
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    return true;
  },
};
