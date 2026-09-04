import Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderService } from "@/lib/services/order.service";
import { connectService } from "@/lib/services/connect.service";
import { InvalidStateError } from "@/lib/domain-errors";
import { notificationService, safeNotify } from "@/lib/services/notification.service";
import { logger } from "@/lib/logger";

type CheckoutInput = {
  shippingAddress: string;
  promoCode?: string;
  idempotencyKey: string;
};

type RefundInput = {
  amountMinor?: number;
  reason?: string;
  sellerOrderId?: string;
  idempotencyKey: string;
};

type QuoteItemSnapshot = {
  productId: string;
  quantity: number;
  size: string;
  unitPrice: number;
};

type QuoteSnapshot = {
  items: QuoteItemSnapshot[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  promoCode: string | null;
};

const DEFAULT_PLATFORM_FEE_BASIS_POINTS = 1_000;

function platformFeeBasisPoints() {
  const configured = process.env.PLATFORM_FEE_BASIS_POINTS;
  if (!configured) return DEFAULT_PLATFORM_FEE_BASIS_POINTS;
  const basisPoints = Number(configured);
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new InvalidStateError("Platform fee configuration is invalid");
  }
  return basisPoints;
}

function calculatePlatformFee(amount: number) {
  return Math.round(amount * platformFeeBasisPoints() / 10_000);
}

type RefundWebhookStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

function readQuoteSnapshot(value: Prisma.JsonValue): QuoteSnapshot {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidStateError("Payment quote is invalid");
  }

  const snapshot = value as Record<string, unknown>;
  const items = snapshot.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new InvalidStateError("Payment quote has no items");
  }

  const parsedItems = items.map((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new InvalidStateError("Payment quote item is invalid");
    }
    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.productId !== "string" ||
      typeof candidate.quantity !== "number" ||
      !Number.isInteger(candidate.quantity) ||
      candidate.quantity < 1 ||
      typeof candidate.size !== "string" ||
      typeof candidate.unitPrice !== "number" ||
      !Number.isSafeInteger(candidate.unitPrice) ||
      candidate.unitPrice < 0
    ) {
      throw new InvalidStateError("Payment quote item is invalid");
    }
    return {
      productId: candidate.productId,
      quantity: candidate.quantity,
      size: candidate.size,
      unitPrice: candidate.unitPrice,
    };
  });

  const totals = ["subtotal", "shippingCost", "tax", "discount", "total"];
  if (totals.some((key) => typeof snapshot[key] !== "number" || !Number.isSafeInteger(snapshot[key] as number) || (snapshot[key] as number) < 0)) {
    throw new InvalidStateError("Payment quote totals are invalid");
  }

  return {
    items: parsedItems,
    subtotal: snapshot.subtotal as number,
    shippingCost: snapshot.shippingCost as number,
    tax: snapshot.tax as number,
    discount: snapshot.discount as number,
    total: snapshot.total as number,
    promoCode: typeof snapshot.promoCode === "string" ? snapshot.promoCode : null,
  };
}

async function finalizeSuccessfulCheckout(
  tx: Prisma.TransactionClient,
  checkout: {
    id: string;
    userId: string;
    shippingAddress: string;
    promoCode: string | null;
    quoteSnapshot: Prisma.JsonValue;
    payment: { id: string; amount: number; currency: string; orderId: string | null } | null;
  },
) {
  if (!checkout.payment) throw new InvalidStateError("Payment record is missing");
  if (checkout.payment.orderId) return checkout.payment.orderId;

  const quote = readQuoteSnapshot(checkout.quoteSnapshot);
  if (quote.total !== checkout.payment.amount || checkout.payment.currency !== "inr") {
    throw new InvalidStateError("Payment amount does not match the checkout quote");
  }

  const order = await tx.order.create({
    data: {
      userId: checkout.userId,
      shippingAddress: checkout.shippingAddress,
      promoCode: checkout.promoCode,
      subtotal: quote.subtotal,
      shippingCost: quote.shippingCost,
      tax: quote.tax,
      discount: quote.discount,
      total: quote.total,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: quote.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.unitPrice,
        })),
      },
    },
    select: { id: true },
  });

  const orderItems = await tx.orderItem.findMany({
    where: { orderId: order.id },
    select: {
      id: true,
      quantity: true,
      price: true,
      product: { select: { artistId: true, processingDays: true, artworkDetails: { select: { fulfillmentMode: true } } } },
    },
  });
  const sellerItems = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const existing = sellerItems.get(item.product.artistId) ?? [];
    existing.push(item);
    sellerItems.set(item.product.artistId, existing);
  }
  let isFirstSeller = true;
  let sellerAllocatedAmount = 0;
  let platformFeeAmount = 0;
  for (const [artistId, items] of sellerItems) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const processingDays = Math.max(...items.map((item) => item.product.processingDays ?? 7));
    const processingDueAt = new Date(Date.now() + processingDays * 24 * 60 * 60 * 1000);
    const sellerOrder = await tx.sellerOrder.create({
      data: {
        orderId: order.id,
        artistId,
        subtotal,
        shippingCost: isFirstSeller ? quote.shippingCost : 0,
        total: subtotal + (isFirstSeller ? quote.shippingCost : 0),
        processingDueAt,
        items: { connect: items.map((item) => ({ id: item.id })) },
      },
      select: { id: true },
    });
    sellerAllocatedAmount += subtotal + (isFirstSeller ? quote.shippingCost : 0);
    const feeAmount = calculatePlatformFee(subtotal);
    platformFeeAmount += feeAmount;
    if (feeAmount > 0) {
      await tx.platformFee.create({
        data: {
          orderId: order.id,
          sellerOrderId: sellerOrder.id,
          amount: feeAmount,
          currency: "inr",
          description: `Artistically platform commission (${platformFeeBasisPoints() / 100}%)`,
        },
      });
    }
    if (typeof tx.sellerSettlement?.create === "function") {
      await tx.sellerSettlement.create({
        data: {
          artistId,
          sellerOrderId: sellerOrder.id,
          currency: "inr",
          grossAmount: subtotal,
          shippingAmount: isFirstSeller ? quote.shippingCost : 0,
          platformFeeAmount: feeAmount,
          netAmount: subtotal + (isFirstSeller ? quote.shippingCost : 0) - feeAmount,
          status: "PENDING",
        },
      });
    }
    for (const item of items) {
      await tx.deliveryRecord.create({
        data: { orderId: order.id, sellerOrderId: sellerOrder.id, orderItemId: item.id, type: "ORDER_CONFIRMED", note: "Payment verified and order confirmed" },
      });
    }
    isFirstSeller = false;
  }

  await tx.paymentReconciliation.create({
    data: {
      paymentId: checkout.payment.id,
      orderId: order.id,
      currency: checkout.payment.currency,
      capturedAmount: checkout.payment.amount,
      sellerAllocatedAmount,
      taxAmount: quote.tax,
      discountAmount: quote.discount,
      platformFeeAmount,
      status: sellerAllocatedAmount + quote.tax - quote.discount === checkout.payment.amount ? "RECONCILED" : "OUT_OF_BALANCE",
    },
  });

  for (const item of quote.items) {
    const stockUpdate = await tx.product.updateMany({
      where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (stockUpdate.count !== 1) {
      throw new InvalidStateError("An artwork is no longer available at the quoted quantity");
    }
  }

  await tx.cartItem.deleteMany({ where: { userId: checkout.userId } });
  await tx.payment.update({ where: { id: checkout.payment.id }, data: { orderId: order.id } });
  return order.id;
}

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new InvalidStateError("Payment checkout is not configured");
  return new Stripe(secretKey);
}

function mapStripeRefundStatus(status: string | null): RefundWebhookStatus {
  switch (status) {
    case "succeeded":
      return "SUCCEEDED";
    case "failed":
      return "FAILED";
    case "canceled":
      return "CANCELLED";
    case "pending":
    default:
      return "PENDING";
  }
}

async function reconcileRefundWebhook(
  tx: Prisma.TransactionClient,
  event: Stripe.Event,
  stripeRefund: Stripe.Refund,
) {
  const refundId = stripeRefund.metadata?.artistically_refund_id;
  const refund = await tx.refund.findFirst({
    where: {
      OR: [
        { stripeRefundId: stripeRefund.id },
        ...(refundId ? [{ id: refundId }] : []),
      ],
    },
    select: {
      id: true,
      orderId: true,
      paymentId: true,
      amount: true,
      status: true,
      payment: { select: { id: true, amount: true } },
    },
  });
  if (!refund) return false;

  try {
    await tx.paymentEvent.create({
      data: {
        paymentId: refund.paymentId,
        stripeEventId: event.id,
        type: event.type,
        payload: event as unknown as object,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
      return true;
    }
    throw error;
  }

  const status = mapStripeRefundStatus(stripeRefund.status);
  if (refund.status === "SUCCEEDED" && status !== "SUCCEEDED") return true;

  await tx.refund.update({
    where: { id: refund.id },
    data: { status, stripeRefundId: stripeRefund.id },
  });

  if (status !== "SUCCEEDED" || !refund.payment) return true;

  const successfulRefunds = await tx.refund.findMany({
    where: { orderId: refund.orderId, status: "SUCCEEDED" },
    select: { amount: true },
  });
  const refundedAmount = successfulRefunds.reduce((sum, item) => sum + item.amount, 0);
  await tx.paymentReconciliation.updateMany({
    where: { paymentId: refund.payment.id },
    data: { refundedAmount, status: refundedAmount <= refund.payment.amount ? "RECONCILED" : "OUT_OF_BALANCE" },
  });
  if (refundedAmount < refund.payment.amount) return true;

  await tx.payment.update({ where: { id: refund.payment.id }, data: { status: "REFUNDED" } });
  await tx.order.update({ where: { id: refund.orderId }, data: { status: "REFUNDED" } });

  const items = await tx.orderItem.findMany({
    where: { orderId: refund.orderId },
    select: { id: true, productId: true, quantity: true, fulfillmentStatus: true },
  });
  if (items.every((item) => item.fulfillmentStatus === "PENDING" || item.fulfillmentStatus === "PROCESSING")) {
    for (const item of items) {
      const claimed = await tx.orderItem.updateMany({
        where: { id: item.id, fulfillmentStatus: { in: ["PENDING", "PROCESSING"] } },
        data: { fulfillmentStatus: "CANCELLED" },
      });
      if (claimed.count === 1) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
  }
  return true;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
}

function stripeLineItems(
  cartItems: Array<{ quantity: number; product: { price: number; title: string } }>,
  quote: QuoteSnapshot,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  let remainingDiscount = quote.discount;
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => {
    const lineAmount = item.product.price * item.quantity;
    const discount = Math.min(lineAmount, remainingDiscount);
    remainingDiscount -= discount;
    return {
      quantity: 1,
      price_data: {
        currency: "inr",
        unit_amount: lineAmount - discount,
        product_data: { name: item.quantity > 1 ? `${item.product.title} × ${item.quantity}` : item.product.title },
      },
    };
  });
  if (remainingDiscount !== 0) throw new InvalidStateError("Checkout discount exceeds the artwork subtotal");
  if (quote.shippingCost > 0) {
    items.push({ quantity: 1, price_data: { currency: "inr", unit_amount: quote.shippingCost, product_data: { name: "Shipping" } } });
  }
  if (quote.tax > 0) {
    items.push({ quantity: 1, price_data: { currency: "inr", unit_amount: quote.tax, product_data: { name: "Tax" } } });
  }
  return items;
}

async function runSerializable<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(callback, { isolationLevel: "Serializable" });
    } catch (error) {
      const isSerializationConflict = typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2034";
      if (!isSerializationConflict || attempt === 2) throw error;
    }
  }
  throw new InvalidStateError("Payment transaction could not be serialized");
}

export const paymentService = {
  async listReconciliations(status?: "RECONCILED" | "OUT_OF_BALANCE") {
    return prisma.paymentReconciliation.findMany({
      where: status ? { status } : undefined,
      select: {
        id: true,
        paymentId: true,
        orderId: true,
        currency: true,
        capturedAmount: true,
        sellerAllocatedAmount: true,
        taxAmount: true,
        discountAmount: true,
        platformFeeAmount: true,
        refundedAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async createCheckoutSession(userId: string, input: CheckoutInput) {
    const existing = await prisma.checkoutSession.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey: input.idempotencyKey } },
      select: { id: true, status: true, stripeSessionId: true },
    });
    if (existing?.stripeSessionId) {
      const session = await stripeClient().checkout.sessions.retrieve(existing.stripeSessionId);
      return { id: existing.id, status: existing.status, url: session.url };
    }
    if (existing) return { id: existing.id, status: existing.status, url: null };

    const quote = await orderService.quote(userId, input.promoCode);
    if (!quote.canCheckout) throw new InvalidStateError("One or more cart items are unavailable");
    const stripe = stripeClient();
    const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
    const amount = quote.total;

    let checkout;
    try {
      checkout = await prisma.checkoutSession.create({
        data: {
          userId,
          idempotencyKey: input.idempotencyKey,
          amount,
          currency: "inr",
          shippingAddress: input.shippingAddress,
          promoCode: quote.promoCode,
          quoteSnapshot: quote,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          payment: { create: { amount, currency: "inr" } },
        },
        select: { id: true, status: true },
      });
    } catch (error) {
      if (!(typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002")) throw error;
      const raced = await prisma.checkoutSession.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey: input.idempotencyKey } },
        select: { id: true, status: true, stripeSessionId: true },
      });
      if (!raced) throw error;
      if (raced.stripeSessionId) {
        const session = await stripeClient().checkout.sessions.retrieve(raced.stripeSessionId);
        return { id: raced.id, status: raced.status, url: session.url };
      }
      return { id: raced.id, status: raced.status, url: null };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: stripeLineItems(cartItems, quote),
        success_url: `${appUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl()}/cart`,
        client_reference_id: checkout.id,
        metadata: { checkout_session_id: checkout.id },
      }, { idempotencyKey: `checkout:${userId}:${input.idempotencyKey}` });

      await prisma.checkoutSession.update({
        where: { id: checkout.id },
        data: { stripeSessionId: session.id },
      });
      return { id: checkout.id, status: checkout.status, url: session.url };
    } catch (error) {
      await prisma.checkoutSession.update({ where: { id: checkout.id }, data: { status: "FAILED" } });
      throw error;
    }
  },

  async handleWebhook(payload: string, signature: string | null) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !signature) throw new InvalidStateError("Payment webhook is not configured");
    const event = stripeClient().webhooks.constructEvent(payload, signature, secret);
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "account.updated", "payout.created", "payout.paid", "payout.failed", "payout.canceled", "payout.updated", "transfer.created", "transfer.reversed", "refund.created", "refund.updated"].includes(event.type)) {
      return { received: true, handled: false };
    }

    if (event.type === "account.updated") {
      return { received: true, handled: (await connectService.handleAccountUpdated(event.data.object as Stripe.Account)).updated };
    }

    if (["payout.created", "payout.paid", "payout.failed", "payout.canceled", "payout.updated"].includes(event.type)) {
      return { received: true, handled: (await connectService.handlePayoutEvent(event.type, event.data.object as Stripe.Payout, event.account ?? null)).updated };
    }

    if (event.type === "transfer.created" || event.type === "transfer.reversed") {
      return { received: true, handled: (await connectService.handleTransferEvent(event.type, event.data.object as Stripe.Transfer)).updated };
    }

    if (event.type === "refund.created" || event.type === "refund.updated") {
      const handled = await runSerializable((tx) => reconcileRefundWebhook(tx, event, event.data.object as Stripe.Refund));
      const stripeRefund = event.data.object as Stripe.Refund;
      const reconciledRefund = typeof prisma.refund?.findUnique === "function"
        ? await prisma.refund.findUnique({ where: { stripeRefundId: stripeRefund.id }, select: { id: true, orderId: true, status: true, amount: true } })
        : null;
      if (reconciledRefund?.status === "SUCCEEDED") {
        safeNotify(notificationService.notifyOrder(reconciledRefund.orderId, { kind: "REFUND", title: "Refund processed", body: `A refund of ${(reconciledRefund.amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })} has been confirmed for your order.`, href: `/tracking?orderId=${reconciledRefund.orderId}`, dedupeKey: `refund:${reconciledRefund.id}` }));
      }
      return { received: true, handled };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const checkoutId = session.metadata?.checkout_session_id ?? session.client_reference_id;
    if (!checkoutId) throw new InvalidStateError("Payment webhook has no checkout reference");

    await runSerializable(async (tx) => {
      const checkout = await tx.checkoutSession.findUnique({ where: { id: checkoutId }, include: { payment: true } });
      if (!checkout) return;
      try {
        await tx.paymentEvent.create({
          data: { paymentId: checkout.payment?.id, stripeEventId: event.id, type: event.type, payload: event as unknown as object, processedAt: new Date() },
        });
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") return;
        throw error;
      }
      // A later failure or expiry event must not downgrade a payment that has
      // already produced a durable order from an earlier success event.
      if (checkout.payment?.orderId) return;
      const succeeded = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
      await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: succeeded ? "COMPLETED" : "FAILED" } });
      if (checkout.payment) {
        await tx.payment.update({
          where: { id: checkout.payment.id },
          data: { status: succeeded ? "SUCCEEDED" : "FAILED", stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined },
        });
      }
      if (succeeded) {
        if (typeof session.amount_total !== "number" || session.amount_total !== checkout.payment?.amount || session.currency !== "inr") {
          throw new InvalidStateError("Stripe payment amount does not match the checkout quote");
        }
        await finalizeSuccessfulCheckout(tx, checkout);
      }
    });
    const finalized = typeof prisma.checkoutSession?.findUnique === "function"
      ? await prisma.checkoutSession.findUnique({ where: { id: checkoutId }, select: { userId: true, payment: { select: { orderId: true } } } })
      : null;
    if (finalized?.payment?.orderId && (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded")) {
      const orderId = finalized.payment.orderId;
      if (typeof prisma.sellerOrder?.findMany === "function") {
        const sellerOrders = await prisma.sellerOrder.findMany({ where: { orderId }, select: { id: true } });
        for (const sellerOrder of sellerOrders) {
          try {
            await connectService.createTransferForSellerOrder(sellerOrder.id);
          } catch (error) {
            // A seller can complete onboarding after the buyer pays. The
            // settlement remains pending and the reconciliation job retries it.
            logger.warn("seller_transfer_deferred", { orderId, sellerOrderId: sellerOrder.id, error });
          }
        }
      }
      safeNotify(notificationService.notifyOrder(orderId, { kind: "PAYMENT", title: "Payment confirmed", body: "Your payment was confirmed and your order is now being prepared.", href: `/tracking?orderId=${orderId}`, dedupeKey: `payment:${orderId}` }));
      safeNotify(notificationService.notifyOrderArtists(orderId, { kind: "FULFILLMENT", title: "New artwork order", body: "A verified payment created a new order for one of your artworks.", href: "/artist-portal?tab=orders", dedupeKey: `seller-payment:${orderId}` }));
    } else if (finalized?.userId && (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired")) {
      safeNotify(notificationService.create({ userId: finalized.userId, kind: "PAYMENT", title: "Payment was not completed", body: "Your checkout session expired or the payment could not be completed. You can try checkout again.", href: "/cart", dedupeKey: `payment-failed:${checkoutId}:${event.type}` }));
    }
    return { received: true, handled: true };
  },

  async createRefund(orderId: string, input: RefundInput) {
    const existing = await prisma.refund.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { id: true, status: true, amount: true, currency: true, stripeRefundId: true },
    });
    if (existing?.status === "SUCCEEDED") return existing;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total: true,
        payment: { select: { id: true, status: true, stripePaymentId: true, amount: true, currency: true } },
        refunds: { where: { status: "SUCCEEDED" }, select: { amount: true } },
        items: { select: { id: true, productId: true, quantity: true, fulfillmentStatus: true } },
        sellerOrders: { select: { id: true, total: true, refunds: { where: { status: "SUCCEEDED" }, select: { amount: true } } } },
      },
    });
    if (!order) throw new InvalidStateError("Order not found");
    if (!order.payment || order.payment.status !== "SUCCEEDED" || !order.payment.stripePaymentId) {
      throw new InvalidStateError("Only successfully paid orders can be refunded");
    }
    if (input.sellerOrderId && !order.sellerOrders.some((sellerOrder) => sellerOrder.id === input.sellerOrderId)) {
      throw new InvalidStateError("Seller order does not belong to this order");
    }

    const orderAmount = order.payment.amount;
    const refundedAmount = order.refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const sellerOrder = input.sellerOrderId ? order.sellerOrders.find((candidate) => candidate.id === input.sellerOrderId) : undefined;
    const sellerOrderAmount = sellerOrder ? sellerOrder.total : orderAmount;
    const sellerRefundedAmount = sellerOrder?.refunds.reduce((sum, refund) => sum + refund.amount, 0) ?? refundedAmount;
    const remainingAmount = sellerOrderAmount - sellerRefundedAmount;
    const amount = input.amountMinor ?? remainingAmount;
    if (amount < 1 || amount > remainingAmount) {
      throw new InvalidStateError("Refund amount exceeds the remaining captured payment");
    }

    const refund = existing ?? await prisma.refund.create({
      data: {
        orderId,
        paymentId: order.payment.id,
        amount,
        currency: order.payment.currency,
        reason: input.reason,
        sellerOrderId: input.sellerOrderId,
        idempotencyKey: input.idempotencyKey,
      },
      select: { id: true, status: true, amount: true, currency: true, stripeRefundId: true },
    });

    const stripe = stripeClient();
    try {
      const stripeRefund = await stripe.refunds.create(
        {
          payment_intent: order.payment.stripePaymentId,
          amount,
          metadata: { artistically_refund_id: refund.id, order_id: order.id },
        },
        { idempotencyKey: `refund:${input.idempotencyKey}` },
      );
      const fullyRefunded = refundedAmount + amount >= orderAmount;
      const updated = await prisma.$transaction(async (tx) => {
        const updated = await tx.refund.update({
          where: { id: refund.id },
          data: { status: "SUCCEEDED", stripeRefundId: stripeRefund.id },
          select: { id: true, status: true, amount: true, currency: true, stripeRefundId: true },
        });
        await tx.deliveryRecord.create({
          data: {
            orderId: order.id,
            sellerOrderId: input.sellerOrderId,
            type: "REFUNDED",
            note: `Refund processed for ${amount} minor currency units${input.reason ? `: ${input.reason}` : ""}`,
          },
        });
        await tx.paymentReconciliation.updateMany({
          where: { paymentId: order.payment!.id },
          data: {
            refundedAmount: refundedAmount + amount,
            status: refundedAmount + amount <= orderAmount ? "RECONCILED" : "OUT_OF_BALANCE",
          },
        });
        if (input.sellerOrderId && typeof tx.sellerSettlement?.update === "function" && typeof tx.sellerSettlement.findUnique === "function") {
          const settlement = await tx.sellerSettlement.findUnique({ where: { sellerOrderId: input.sellerOrderId }, select: { id: true, netAmount: true, transferredAmount: true } });
          if (settlement) {
            const refundAmount = sellerRefundedAmount + amount;
            await tx.sellerSettlement.update({
              where: { id: settlement.id },
              data: { refundAmount, status: settlement.transferredAmount > 0 && refundAmount > 0 ? "OUT_OF_BALANCE" : refundAmount >= settlement.netAmount ? "REFUNDED" : "PENDING", reconciledAt: new Date() },
            });
          }
        }
        if (fullyRefunded) {
          await tx.payment.update({ where: { id: order.payment!.id }, data: { status: "REFUNDED" } });
          await tx.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } });
          if (order.items.every((item) => item.fulfillmentStatus === "PENDING" || item.fulfillmentStatus === "PROCESSING")) {
            for (const item of order.items) {
              await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
              await tx.orderItem.update({ where: { id: item.id }, data: { fulfillmentStatus: "CANCELLED" } });
            }
          }
        }
        return updated;
      });
      safeNotify(notificationService.notifyOrder(order.id, { kind: "REFUND", title: "Refund processed", body: `A refund of ${(amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })} has been processed for your order.`, href: `/tracking?orderId=${order.id}`, dedupeKey: `refund:${refund.id}` }));
      return updated;
    } catch (error) {
      await prisma.refund.update({ where: { id: refund.id }, data: { status: "FAILED" } });
      throw error;
    }
  },
};
