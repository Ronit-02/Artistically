import { InvalidStateError } from "@/lib/domain-errors";
import { prisma } from "@/lib/prisma";
import { notificationService, safeNotify } from "@/lib/services/notification.service";

type ShipmentInput = {
  status: "LABEL_CREATED" | "IN_TRANSIT" | "DELIVERED" | "EXCEPTION";
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  location?: string;
  note?: string;
};

type ProviderShipmentEvent = ShipmentInput & {
  eventId: string;
  sellerOrderId: string;
  occurredAt: Date;
};

const statusOrder: Record<ShipmentInput["status"] | "PENDING", number> = {
  PENDING: 0,
  LABEL_CREATED: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
  EXCEPTION: 1,
};

const sellerStatus: Record<ShipmentInput["status"], "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "PROCESSING"> = {
  LABEL_CREATED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  EXCEPTION: "PROCESSING",
};

export const shipmentService = {
  async updateSellerShipment(sellerOrderId: string, userId: string, input: ShipmentInput) {
    const sellerOrder = await prisma.sellerOrder.findFirst({
      where: { id: sellerOrderId, artist: { userId } },
      select: { id: true, orderId: true, status: true, shipment: { select: { status: true } } },
    });
    if (!sellerOrder) return null;

    const currentStatus = sellerOrder.shipment?.status ?? "PENDING";
    if (input.status !== "EXCEPTION" && statusOrder[input.status] < statusOrder[currentStatus]) {
      throw new InvalidStateError("Shipment status cannot move backwards");
    }
    if (sellerOrder.status === "REFUNDED" || sellerOrder.status === "CANCELLED") {
      throw new InvalidStateError("A cancelled or refunded seller order cannot be shipped");
    }

    const occurredAt = new Date();
    const shipment = await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.upsert({
        where: { sellerOrderId },
        create: {
          sellerOrderId,
          status: input.status,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
          shippedAt: input.status === "LABEL_CREATED" ? occurredAt : undefined,
          deliveredAt: input.status === "DELIVERED" ? occurredAt : undefined,
        },
        update: {
          status: input.status,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
          shippedAt: input.status === "LABEL_CREATED" ? occurredAt : undefined,
          deliveredAt: input.status === "DELIVERED" ? occurredAt : undefined,
        },
        select: { id: true, sellerOrderId: true, status: true, carrier: true, trackingNumber: true, trackingUrl: true },
      });
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: input.status,
          occurredAt,
          location: input.location,
          note: input.note,
        },
      });
      await tx.sellerOrder.update({ where: { id: sellerOrderId }, data: { status: sellerStatus[input.status] } });
      await tx.deliveryRecord.create({
        data: {
          orderId: sellerOrder.orderId,
          sellerOrderId,
          type: input.status === "DELIVERED" ? "DELIVERED" : input.status === "LABEL_CREATED" ? "SHIPPED" : "PROCESSING_STARTED",
          note: input.note,
        },
      });
      return shipment;
    });
    const title = input.status === "DELIVERED" ? "Artwork delivered" : input.status === "IN_TRANSIT" ? "Artwork in transit" : input.status === "LABEL_CREATED" ? "Artwork has shipped" : "Shipment update";
    safeNotify(notificationService.notifyOrder(sellerOrder.orderId, { kind: "DELIVERY", title, body: input.note ?? `Your artwork shipment status is now ${input.status.toLowerCase().replace("_", " ")}.`, href: `/tracking?orderId=${sellerOrder.orderId}`, dedupeKey: `shipment:${sellerOrderId}:${input.status}` }));
    safeNotify(notificationService.notifySellerOrder(sellerOrderId, { kind: "DELIVERY", title: `Shipment ${input.status.toLowerCase().replace("_", " ")}`, body: `Shipment status for order ${sellerOrder.orderId} is ${input.status.toLowerCase().replace("_", " ")}.`, href: "/artist-portal?tab=orders", dedupeKey: `seller-shipment:${sellerOrderId}:${input.status}` }));
    return shipment;
  },

  async handleProviderEvent(input: ProviderShipmentEvent) {
    const result = await prisma.$transaction(async (tx) => {
      const sellerOrder = await tx.sellerOrder.findUnique({
        where: { id: input.sellerOrderId },
        select: { id: true, orderId: true, status: true, shipment: { select: { id: true, status: true } } },
      });
      if (!sellerOrder) return { handled: false, reason: "not_found" as const };

      const existingEvent = await tx.shipmentEvent.findUnique({
        where: { providerEventId: input.eventId },
        select: { id: true },
      });
      if (existingEvent) return { handled: false, reason: "duplicate" as const };

      const currentStatus = sellerOrder.shipment?.status ?? "PENDING";
      const shouldAdvance = input.status === "EXCEPTION" || statusOrder[input.status] >= statusOrder[currentStatus];
      const nextStatus = shouldAdvance ? input.status : currentStatus;
      const shipment = await tx.shipment.upsert({
        where: { sellerOrderId: input.sellerOrderId },
        create: {
          sellerOrderId: input.sellerOrderId,
          status: input.status,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
          shippedAt: input.status === "LABEL_CREATED" ? input.occurredAt : undefined,
          deliveredAt: input.status === "DELIVERED" ? input.occurredAt : undefined,
        },
        update: shouldAdvance ? {
          status: nextStatus,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          trackingUrl: input.trackingUrl,
          shippedAt: input.status === "LABEL_CREATED" ? input.occurredAt : undefined,
          deliveredAt: input.status === "DELIVERED" ? input.occurredAt : undefined,
        } : {},
        select: { id: true, status: true },
      });
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          providerEventId: input.eventId,
          status: input.status,
          occurredAt: input.occurredAt,
          location: input.location,
          note: input.note,
          payload: { ...input, occurredAt: input.occurredAt.toISOString() },
        },
      });
      await tx.deliveryRecord.create({
        data: {
          orderId: sellerOrder.orderId,
          sellerOrderId: input.sellerOrderId,
          type: input.status === "DELIVERED" ? "DELIVERED" : input.status === "LABEL_CREATED" ? "SHIPPED" : "PROCESSING_STARTED",
          occurredAt: input.occurredAt,
          note: input.note,
          metadata: { providerEventId: input.eventId },
        },
      });
      if (shouldAdvance) {
        await tx.sellerOrder.update({ where: { id: input.sellerOrderId }, data: { status: sellerStatus[input.status] } });
      }
      return { handled: true, reason: "processed" as const, orderId: sellerOrder.orderId, shipment };
    });
    if (result.handled && result.orderId) {
      const title = input.status === "DELIVERED" ? "Artwork delivered" : input.status === "IN_TRANSIT" ? "Artwork in transit" : "Shipment update";
      safeNotify(notificationService.notifyOrder(result.orderId, { kind: "DELIVERY", title, body: input.note ?? `Your shipment status is now ${input.status.toLowerCase().replace("_", " ")}.`, href: `/tracking?orderId=${result.orderId}`, dedupeKey: `provider-shipment:${input.eventId}` }));
    }
    return result;
  },
};
