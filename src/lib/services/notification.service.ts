import { prisma } from "@/lib/prisma";
import { deliverTransactionalEmail } from "@/lib/integrations/email";

type NotificationInput = {
  userId: string;
  kind: "PAYMENT" | "FULFILLMENT" | "DELIVERY" | "CANCELLATION" | "REFUND" | "PAYOUT";
  title: string;
  body: string;
  href?: string;
  dedupeKey: string;
};

async function createNotification(input: NotificationInput) {
  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, email: true } });
  if (!user) return null;
  const existing = await prisma.notification.findUnique({ where: { dedupeKey: input.dedupeKey }, select: { id: true } });
  if (existing) return existing;

  const notification = await prisma.$transaction(async (tx) => {
    const created = await tx.notification.create({ data: input });
    await tx.emailDelivery.create({
      data: {
        userId: user.id,
        notificationId: created.id,
        eventKey: input.dedupeKey,
        toEmail: user.email,
        subject: input.title,
        body: input.body,
        status: "QUEUED",
      },
    });
    return created;
  });

  try {
    const result = await deliverTransactionalEmail({ to: user.email, subject: input.title, body: input.body, eventKey: input.dedupeKey });
    if (result.delivered) await prisma.emailDelivery.update({ where: { eventKey: input.dedupeKey }, data: { status: "SENT", sentAt: new Date(), error: null } });
  } catch (error) {
    await prisma.emailDelivery.update({ where: { eventKey: input.dedupeKey }, data: { status: "FAILED", failedAt: new Date(), error: error instanceof Error ? error.message : "Email delivery failed" } });
  }
  return notification;
}

export const notificationService = {
  create: createNotification,
  async listForUser(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, kind: true, title: true, body: true, href: true, readAt: true, createdAt: true } });
  },
  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },
  async markRead(id: string, userId: string) {
    const result = await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
    return result.count === 1;
  },
  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  },
  async notifyOrder(orderId: string, input: Omit<NotificationInput, "userId" | "dedupeKey"> & { dedupeKey: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true } });
    return order ? createNotification({ ...input, userId: order.userId, dedupeKey: input.dedupeKey }) : null;
  },
  async notifySellerOrder(sellerOrderId: string, input: Omit<NotificationInput, "userId" | "dedupeKey"> & { dedupeKey: string }) {
    const sellerOrder = await prisma.sellerOrder.findUnique({ where: { id: sellerOrderId }, select: { id: true, artist: { select: { userId: true } } } });
    return sellerOrder ? createNotification({ ...input, userId: sellerOrder.artist.userId, dedupeKey: input.dedupeKey }) : null;
  },
  async notifyOrderArtists(orderId: string, input: Omit<NotificationInput, "userId" | "dedupeKey"> & { dedupeKey: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { sellerOrders: { select: { id: true, artist: { select: { userId: true } } } } } });
    if (!order) return [];
    return Promise.all(order.sellerOrders.map((sellerOrder) => createNotification({ ...input, userId: sellerOrder.artist.userId, dedupeKey: `${input.dedupeKey}:${sellerOrder.id}` })));
  },
};

export function safeNotify(task: Promise<unknown>) {
  void task.catch(() => undefined);
}
