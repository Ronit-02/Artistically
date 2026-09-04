import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { InvalidStateError } from "@/lib/domain-errors";
import { serverEnv } from "@/lib/env";
import { notificationService, safeNotify } from "@/lib/services/notification.service";

const DIGITAL_EXPIRY_DAYS = 30;
const DIGITAL_TOKEN_TTL_SECONDS = 300;

function tokenSecret() {
  return serverEnv.JWT_SECRET ?? "artistically-local-digital-download-secret";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createDigitalDownloadToken(input: { orderId: string; orderItemId: string; userId: string }) {
  const payload = encode(JSON.stringify({ ...input, exp: Math.floor(Date.now() / 1000) + DIGITAL_TOKEN_TTL_SECONDS }));
  const signature = createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyDigitalDownloadToken(token: string, input: { orderId: string; orderItemId: string; userId: string }) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return false;
  try {
    const decoded = JSON.parse(decode(payload)) as typeof input & { exp: number };
    return decoded.orderId === input.orderId && decoded.orderItemId === input.orderItemId && decoded.userId === input.userId && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function digitalAssetUrl(assetReference: string) {
  try {
    const url = new URL(assetReference);
    if (url.protocol !== "https:") throw new InvalidStateError("Digital asset URLs must use HTTPS");
    return url.toString();
  } catch (error) {
    if (error instanceof InvalidStateError) throw error;
    if (!serverEnv.DIGITAL_ASSET_BASE_URL) throw new InvalidStateError("Digital asset provider is not configured");
    return new URL(encodeURIComponent(assetReference), `${serverEnv.DIGITAL_ASSET_BASE_URL.replace(/\/$/, "")}/`).toString();
  }
}

function expiryDate() {
  return new Date(Date.now() + DIGITAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

export const postPurchaseService = {
  async listDeliveryRecords(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId }, select: { id: true } });
    if (!order) return null;
    return prisma.deliveryRecord.findMany({
      where: { orderId },
      orderBy: { occurredAt: "asc" },
      select: { id: true, type: true, occurredAt: true, note: true, orderItemId: true, sellerOrderId: true },
    });
  },

  async publishDigitalDelivery(orderItemId: string, userId: string, assetReference: string, downloadLimit: number) {
    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        id: true,
        orderId: true,
        order: { select: { status: true } },
        product: { select: { id: true, artworkDetails: { select: { fulfillmentMode: true } }, artist: { select: { userId: true } } } },
      },
    });
    if (!item || item.product.artist.userId !== userId) return null;
    if (item.product.artworkDetails?.fulfillmentMode !== "DIGITAL") {
      throw new InvalidStateError("Only digital artwork can receive a digital delivery");
    }
    if (item.order.status === "CANCELLED" || item.order.status === "REFUNDED") {
      throw new InvalidStateError("Cancelled or refunded orders cannot receive a digital delivery");
    }

    const mediaAsset = await prisma.mediaAsset.findFirst({ where: { id: assetReference, artist: { userId }, productId: item.product.id, status: "READY", purpose: "DIGITAL_FILE" }, select: { id: true, providerKey: true } });
    if (assetReference && !mediaAsset && !/^https:\/\//.test(assetReference)) throw new InvalidStateError("Digital delivery must reference a ready private media asset belonging to this artwork or an HTTPS provider URL");

    const availableAt = new Date();
    const delivery = await prisma.$transaction(async (tx) => {
      const delivery = await tx.digitalDelivery.upsert({
        where: { orderItemId },
        create: { orderItemId, assetReference: mediaAsset?.providerKey ?? assetReference, mediaAssetId: mediaAsset?.id, downloadLimit, status: "AVAILABLE", availableAt, expiresAt: expiryDate() },
        update: { assetReference: mediaAsset?.providerKey ?? assetReference, mediaAssetId: mediaAsset?.id, downloadLimit, status: "AVAILABLE", availableAt, expiresAt: expiryDate() },
      });
      await tx.orderItem.update({ where: { id: orderItemId }, data: { fulfillmentStatus: "DELIVERED" } });
      await tx.deliveryRecord.create({
        data: { orderId: item.orderId, orderItemId, type: "DIGITAL_AVAILABLE", actorId: userId, note: "Digital artwork made available to the buyer" },
      });
      return delivery;
    });
    safeNotify(notificationService.notifyOrder(item.orderId, { kind: "DELIVERY", title: "Digital artwork is ready", body: "Your digital artwork is now available for download from your order.", href: `/tracking?orderId=${item.orderId}`, dedupeKey: `digital-available:${orderItemId}` }));
    return delivery;
  },

  async getDigitalDelivery(orderId: string, orderItemId: string, userId: string) {
    return prisma.digitalDelivery.findFirst({
      where: { orderItemId, orderItem: { orderId, order: { userId } } },
      select: { id: true, orderItemId: true, status: true, downloadLimit: true, downloadCount: true, expiresAt: true, availableAt: true, deliveredAt: true, licenseAcceptedAt: true },
    });
  },

  async getDigitalAssetReference(orderId: string, orderItemId: string, userId: string) {
    const delivery = await prisma.digitalDelivery.findFirst({
      where: { orderItemId, orderItem: { orderId, order: { userId } } },
      select: { assetReference: true, status: true, expiresAt: true },
    });
    if (!delivery || delivery.status === "EXPIRED" || delivery.status === "REVOKED" || (delivery.expiresAt && delivery.expiresAt <= new Date())) return null;
    return delivery;
  },

  async prepareDigitalDownload(orderId: string, orderItemId: string, userId: string, acceptLicense: boolean) {
    const delivery = await this.getDigitalDelivery(orderId, orderItemId, userId);
    if (!delivery) return null;
    if (delivery.status === "EXPIRED" || (delivery.expiresAt && delivery.expiresAt <= new Date())) throw new InvalidStateError("Digital delivery has expired");
    if (delivery.status === "REVOKED") throw new InvalidStateError("Digital delivery is no longer available");
    if (!acceptLicense) throw new InvalidStateError("License acceptance is required before download");
    if (delivery.downloadCount >= delivery.downloadLimit) throw new InvalidStateError("Digital download limit reached");
    return delivery;
  },

  async downloadDigitalDelivery(orderId: string, orderItemId: string, userId: string, acceptLicense: boolean) {
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.digitalDelivery.findFirst({
        where: { orderItemId, orderItem: { orderId, order: { userId } } },
        select: { id: true, orderItemId: true, assetReference: true, mediaAssetId: true, status: true, downloadLimit: true, downloadCount: true, expiresAt: true, orderItem: { select: { orderId: true } } },
      });
      if (!delivery) return null;
      if (delivery.status === "EXPIRED" || (delivery.expiresAt && delivery.expiresAt <= new Date())) {
        await tx.digitalDelivery.update({ where: { id: delivery.id }, data: { status: "EXPIRED" } });
        throw new InvalidStateError("Digital delivery has expired");
      }
      if (delivery.status === "REVOKED") throw new InvalidStateError("Digital delivery is no longer available");
      if (!acceptLicense) throw new InvalidStateError("License acceptance is required before download");
      if (delivery.downloadCount >= delivery.downloadLimit) throw new InvalidStateError("Digital download limit reached");

      const now = new Date();
      const updated = await tx.digitalDelivery.update({
        where: { id: delivery.id },
        data: { status: "DOWNLOADED", downloadCount: { increment: 1 }, lastDownloadedAt: now, deliveredAt: delivery.downloadCount === 0 ? now : undefined, licenseAcceptedAt: now },
         select: { id: true, status: true, downloadCount: true, downloadLimit: true, expiresAt: true, assetReference: true, mediaAssetId: true },
      });
      await tx.deliveryRecord.create({ data: { orderId: delivery.orderItem.orderId, orderItemId, type: "DIGITAL_DOWNLOADED", actorId: userId } });
      return updated;
    });
  },

  async openDispute(orderId: string, claimantId: string, input: { type: "DAMAGE" | "NON_DELIVERY" | "AUTHENTICITY" | "COPYRIGHT" | "DIGITAL_ACCESS" | "OTHER"; reason: string; orderItemId?: string; sellerOrderId?: string }) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: claimantId }, select: { id: true, status: true } });
    if (!order) return null;
    if (order.status === "CANCELLED") throw new InvalidStateError("Cancelled orders cannot open a dispute");
    if (input.orderItemId) {
      const item = await prisma.orderItem.findFirst({ where: { id: input.orderItemId, orderId }, select: { id: true } });
      if (!item) throw new InvalidStateError("Order item does not belong to this order");
    }
    if (input.sellerOrderId) {
      const sellerOrder = await prisma.sellerOrder.findFirst({ where: { id: input.sellerOrderId, orderId }, select: { id: true } });
      if (!sellerOrder) throw new InvalidStateError("Seller order does not belong to this order");
    }
    const existing = await prisma.dispute.findFirst({ where: { orderId, claimantId, status: { in: ["OPEN", "UNDER_REVIEW"] } }, select: { id: true } });
    if (existing) throw new InvalidStateError("An active dispute already exists for this order");
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({ data: { orderId, claimantId, type: input.type, reason: input.reason, orderItemId: input.orderItemId, sellerOrderId: input.sellerOrderId } });
      await tx.deliveryRecord.create({ data: { orderId, orderItemId: input.orderItemId, sellerOrderId: input.sellerOrderId, actorId: claimantId, type: "DISPUTE_OPENED", note: input.reason } });
      return dispute;
    });
  },

  async listDisputesForUser(orderId: string, claimantId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: claimantId }, select: { id: true } });
    if (!order) return null;
    return prisma.dispute.findMany({ where: { orderId, claimantId }, orderBy: { createdAt: "desc" } });
  },

  async listDisputesForAdmin(status?: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED") {
    return prisma.dispute.findMany({ where: status ? { status } : undefined, include: { order: { select: { id: true, total: true, status: true } }, claimant: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: "asc" } });
  },

  async resolveDispute(disputeId: string, reviewerId: string, status: "UNDER_REVIEW" | "RESOLVED" | "REJECTED", resolutionNote?: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId }, select: { id: true, orderId: true, status: true, orderItemId: true, sellerOrderId: true } });
    if (!dispute) return null;
    if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") throw new InvalidStateError("Dispute is already closed");
    return prisma.$transaction(async (tx) => {
      const resolvedAt = status === "RESOLVED" || status === "REJECTED" ? new Date() : undefined;
      const updated = await tx.dispute.update({ where: { id: disputeId }, data: { status, reviewerId, resolutionNote, resolvedAt } });
      if (resolvedAt) await tx.deliveryRecord.create({ data: { orderId: dispute.orderId, orderItemId: dispute.orderItemId, sellerOrderId: dispute.sellerOrderId, actorId: reviewerId, type: "DISPUTE_RESOLVED", note: resolutionNote } });
      return updated;
    });
  },

  async markLateSellerOrders(now = new Date()) {
    return prisma.sellerOrder.updateMany({ where: { status: "PROCESSING", processingDueAt: { lt: now }, lateAt: null }, data: { lateAt: now } });
  },

  async reconcileFulfillment(now = new Date()) {
    const [expiredDigitalDeliveries, lateSellerOrders] = await prisma.$transaction([
      prisma.digitalDelivery.updateMany({
        where: { status: { in: ["AVAILABLE", "DOWNLOADED"] }, expiresAt: { lt: now } },
        data: { status: "EXPIRED" },
      }),
      prisma.sellerOrder.updateMany({
        where: { status: "PROCESSING", processingDueAt: { lt: now }, lateAt: null },
        data: { lateAt: now },
      }),
    ]);
    return { expiredDigitalDeliveries: expiredDigitalDeliveries.count, lateSellerOrders: lateSellerOrders.count };
  },
};
