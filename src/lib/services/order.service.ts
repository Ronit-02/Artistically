// ─────────────────────────────────────────────────────────────────────────────
// lib/services/order.service.ts
// Checkout logic: validate cart → create order → clear cart (transaction)
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { notificationService, safeNotify } from "@/lib/services/notification.service";
import { OrderStatus } from "@prisma/client";
import { InvalidStateError } from "@/lib/domain-errors";

const SHIPPING_COST_MINOR = 20_000;
const TAX_BASIS_POINTS = 1_200;
const PROMO_CODES_BASIS_POINTS: Record<string, number> = {
  ART10: 1_000,
  SAVE20: 2_000,
};

export const orderService = {
  async quote(userId: string, promoCode?: string) {
    const normalizedPromoCode = promoCode?.trim().toUpperCase() || undefined;
    if (normalizedPromoCode && PROMO_CODES_BASIS_POINTS[normalizedPromoCode] === undefined) {
      throw new InvalidStateError("Promo code is invalid");
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cartItems.length === 0) throw new InvalidStateError("Cart is empty");

    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      unitPrice: item.product.price,
      stock: item.product.stock,
      available: item.product.isActive && item.product.stock >= item.quantity,
    }));
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountBasisPoints = normalizedPromoCode ? PROMO_CODES_BASIS_POINTS[normalizedPromoCode] : 0;
    const discount = Math.round(subtotal * discountBasisPoints / 10_000);
    const tax = Math.round(subtotal * TAX_BASIS_POINTS / 10_000);

    return {
      items,
      subtotal,
      shippingCost: SHIPPING_COST_MINOR,
      tax,
      discount,
      total: subtotal + SHIPPING_COST_MINOR + tax - discount,
      promoCode: normalizedPromoCode ?? null,
      canCheckout: items.every((item) => item.available),
    };
  },

  async listForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            digitalDelivery: { select: { id: true, status: true, downloadLimit: true, downloadCount: true, expiresAt: true, availableAt: true, licenseAcceptedAt: true } },
            product: {
              select: {
                id: true,
                title: true,
                images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
                artworkDetails: { select: { fulfillmentMode: true } },
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

  async listForArtist(userId: string) {
    return prisma.order.findMany({
      where: { items: { some: { product: { artist: { userId } } } } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        sellerOrders: { where: { artist: { userId } }, select: { id: true, status: true, processingDueAt: true, lateAt: true } },
        items: {
          where: { product: { artist: { userId } } },
          select: {
            id: true,
            quantity: true,
            size: true,
            price: true,
            fulfillmentStatus: true,
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
      orderBy: { createdAt: "desc" },
    });
  },

  async listSettlementsForArtist(userId: string) {
    const artist = await prisma.artist.findUnique({ where: { userId }, select: { id: true } });
    if (!artist) return { sellerOrders: [], payouts: [] };

    const [sellerOrders, payouts, settlements] = await Promise.all([
      prisma.sellerOrder.findMany({
        where: { artistId: artist.id },
        select: {
          id: true,
          orderId: true,
          status: true,
          createdAt: true,
          subtotal: true,
          shippingCost: true,
          platformFees: { select: { amount: true, currency: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payout.findMany({
        where: { artistId: artist.id },
        select: { id: true, status: true, amount: true, currency: true, availableAt: true, paidAt: true },
        orderBy: { createdAt: "desc" },
      }),
      typeof prisma.sellerSettlement?.findMany === "function"
        ? prisma.sellerSettlement.findMany({
          where: { artistId: artist.id },
          select: { id: true, sellerOrderId: true, currency: true, grossAmount: true, shippingAmount: true, platformFeeAmount: true, refundAmount: true, netAmount: true, transferredAmount: true, status: true, reconciledAt: true, transfer: { select: { id: true, stripeTransferId: true, status: true, amount: true } } },
          orderBy: { createdAt: "desc" },
        })
        : [],
    ]);

    const settlementRows = settlements.map((settlement) => ({
      id: settlement.id,
      sellerOrderId: settlement.sellerOrderId,
      currency: settlement.currency,
      grossAmountMinor: settlement.grossAmount,
      shippingAmountMinor: settlement.shippingAmount,
      platformFeeAmountMinor: settlement.platformFeeAmount,
      refundAmountMinor: settlement.refundAmount,
      netAmountMinor: settlement.netAmount,
      transferredAmountMinor: settlement.transferredAmount,
      outstandingAmountMinor: Math.max(0, settlement.netAmount - settlement.refundAmount - settlement.transferredAmount),
      status: settlement.status,
      reconciledAt: settlement.reconciledAt?.toISOString() ?? null,
      transfer: settlement.transfer ? { id: settlement.transfer.id, stripeTransferId: settlement.transfer.stripeTransferId, status: settlement.transfer.status, amountMinor: settlement.transfer.amount } : null,
    }));
    const statement = settlementRows.reduce((summary, settlement) => ({
      ...summary,
      grossAmountMinor: summary.grossAmountMinor + settlement.grossAmountMinor,
      shippingAmountMinor: summary.shippingAmountMinor + settlement.shippingAmountMinor,
      platformFeeAmountMinor: summary.platformFeeAmountMinor + settlement.platformFeeAmountMinor,
      refundAmountMinor: summary.refundAmountMinor + settlement.refundAmountMinor,
      netAmountMinor: summary.netAmountMinor + settlement.netAmountMinor,
      transferredAmountMinor: summary.transferredAmountMinor + settlement.transferredAmountMinor,
      outstandingAmountMinor: summary.outstandingAmountMinor + settlement.outstandingAmountMinor,
    }), { currency: "inr", grossAmountMinor: 0, shippingAmountMinor: 0, platformFeeAmountMinor: 0, refundAmountMinor: 0, netAmountMinor: 0, transferredAmountMinor: 0, outstandingAmountMinor: 0 });

    return {
      sellerOrders: sellerOrders.map((sellerOrder) => {
        const platformFeeAmountMinor = sellerOrder.platformFees.reduce((sum, fee) => sum + fee.amount, 0);
        const grossArtworkAmountMinor = sellerOrder.subtotal;
        const shippingAmountMinor = sellerOrder.shippingCost;
        return {
          id: sellerOrder.id,
          orderId: sellerOrder.orderId,
          status: sellerOrder.status,
          createdAt: sellerOrder.createdAt.toISOString(),
          grossArtworkAmountMinor,
          shippingAmountMinor,
          platformFeeAmountMinor,
          netAllocatedAmountMinor: grossArtworkAmountMinor + shippingAmountMinor - platformFeeAmountMinor,
          currency: sellerOrder.platformFees[0]?.currency ?? "inr",
        };
      }),
      payouts: payouts.map((payout) => ({
        id: payout.id,
        status: payout.status,
        amountMinor: payout.amount,
        currency: payout.currency,
        availableAt: payout.availableAt?.toISOString() ?? null,
        paidAt: payout.paidAt?.toISOString() ?? null,
      })),
      settlements: settlementRows,
      statement: { ...statement, status: statement.outstandingAmountMinor >= 0 ? "RECONCILED" : "OUT_OF_BALANCE" },
    };
  },

  async updateSellerItemStatus(itemId: string, userId: string, status: "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED") {
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      select: { id: true, orderId: true, fulfillmentStatus: true, product: { select: { artist: { select: { userId: true } } } } },
    });
    if (!item || item.product.artist.userId !== userId) return null;

    const statusOrder: Record<string, number> = {
      PENDING: 0, PROCESSING: 1, SHIPPED: 2, IN_TRANSIT: 3, DELIVERED: 4, CANCELLED: -1,
    };
    if (statusOrder[status] < statusOrder[item.fulfillmentStatus]) {
      throw new InvalidStateError("Fulfillment status cannot move backwards");
    }
    const updated = await prisma.orderItem.update({ where: { id: itemId }, data: { fulfillmentStatus: status } });
    safeNotify(notificationService.notifyOrder(item.orderId, { kind: "FULFILLMENT", title: `Your artwork is ${status.toLowerCase().replace("_", " ")}`, body: `The fulfillment status for your artwork has been updated to ${status.toLowerCase().replace("_", " ")}.`, href: `/tracking?orderId=${item.orderId}`, dedupeKey: `fulfillment:${itemId}:${status}` }));
    return updated;
  },

  async getById(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            digitalDelivery: { select: { id: true, status: true, downloadLimit: true, downloadCount: true, expiresAt: true, availableAt: true, licenseAcceptedAt: true } },
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
        deliveryRecords: { orderBy: { occurredAt: "asc" } },
        disputes: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  // Checkout: convert cart to order in a single transaction
  async checkout(userId: string, shippingAddress: string, promoCode?: string) {
    const normalizedPromoCode = promoCode?.trim().toUpperCase() || undefined;
    if (normalizedPromoCode && PROMO_CODES_BASIS_POINTS[normalizedPromoCode] === undefined) {
      throw new InvalidStateError("Promo code is invalid");
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new InvalidStateError("Cart is empty");
    }

    // Validate the current snapshot for a useful error before opening the
    // transaction. The guarded update below remains authoritative.
    for (const item of cartItems) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        throw new InvalidStateError(`"${item.product.title}" has insufficient stock`);
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const discountBasisPoints = normalizedPromoCode ? PROMO_CODES_BASIS_POINTS[normalizedPromoCode] : 0;
    const discountAmount = Math.round(subtotal * discountBasisPoints / 10_000);
    const tax = Math.round(subtotal * TAX_BASIS_POINTS / 10_000);
    const total = subtotal + SHIPPING_COST_MINOR + tax - discountAmount;

    // Everything in one transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress,
          promoCode: normalizedPromoCode,
          subtotal,
          shippingCost: SHIPPING_COST_MINOR,
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

      // 2. Decrement stock only when the row still has enough inventory.
      // Concurrent checkouts that lose this guard abort the whole transaction.
      for (const item of cartItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockUpdate.count !== 1) {
          throw new InvalidStateError(`"${item.product.title}" has insufficient stock`);
        }
      }

      // 3. Clear the cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return order;
  },

  async cancel(id: string, userId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { payment: { select: { status: true } } },
    });
    if (!order) return false;
    if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.CONFIRMED) {
      throw new InvalidStateError("Order cannot be cancelled at this stage");
    }
    if (order.payment?.status === "SUCCEEDED") {
      throw new InvalidStateError("Paid orders require a refund workflow before cancellation");
    }

    await prisma.$transaction(async (tx) => {
      // Claim cancellation inside the transaction. A concurrent request that
      // observes the same pre-cancel state must lose this guarded update and
      // cannot restore inventory a second time.
      const transition = await tx.order.updateMany({
        where: {
          id,
          userId,
          status: { in: [OrderStatus.PROCESSING, OrderStatus.CONFIRMED] },
        },
        data: { status: OrderStatus.CANCELLED },
      });
      if (transition.count !== 1) {
        throw new InvalidStateError("Order cannot be cancelled at this stage");
      }

      // Restore stock after the guarded state transition. Any failure rolls
      // back both the inventory changes and the cancellation claim.
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.deliveryRecord.create({ data: { orderId: id, actorId: userId, type: "CANCELLED", note: "Order cancelled before fulfillment" } });
    });

    safeNotify(notificationService.notifyOrder(id, { kind: "CANCELLATION", title: "Order cancelled", body: "Your order was cancelled before fulfillment and inventory was restored.", href: `/tracking?orderId=${id}`, dedupeKey: `cancellation:${id}` }));

    return true;
  },
};
