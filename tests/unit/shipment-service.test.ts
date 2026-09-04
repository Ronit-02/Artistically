import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sellerOrderFindFirst: vi.fn(),
  sellerOrderFindUnique: vi.fn(),
  transaction: vi.fn(),
  shipmentUpsert: vi.fn(),
  shipmentEventCreate: vi.fn(),
  shipmentEventFindUnique: vi.fn(),
  sellerOrderUpdate: vi.fn(),
  deliveryRecordCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sellerOrder: { findFirst: mocks.sellerOrderFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { shipmentService } from "@/lib/services/shipment.service";

function transactionClient() {
  return {
    sellerOrder: { findUnique: mocks.sellerOrderFindUnique, update: mocks.sellerOrderUpdate },
    shipment: { upsert: mocks.shipmentUpsert },
    shipmentEvent: { create: mocks.shipmentEventCreate, findUnique: mocks.shipmentEventFindUnique },
    deliveryRecord: { create: mocks.deliveryRecordCreate },
  };
}

describe("shipment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sellerOrderFindFirst.mockResolvedValue({ id: "seller-order-1", status: "PROCESSING", shipment: { status: "PENDING" } });
    mocks.sellerOrderFindUnique.mockResolvedValue({ id: "seller-order-1", status: "PROCESSING", shipment: null });
    mocks.shipmentUpsert.mockResolvedValue({ id: "shipment-1", sellerOrderId: "seller-order-1", status: "IN_TRANSIT", carrier: "BlueDart", trackingNumber: "BD123", trackingUrl: null });
    mocks.shipmentEventCreate.mockResolvedValue({});
    mocks.shipmentEventFindUnique.mockResolvedValue(null);
    mocks.sellerOrderUpdate.mockResolvedValue({});
    mocks.transaction.mockImplementation(async (callback: (tx: ReturnType<typeof transactionClient>) => unknown) => callback(transactionClient()));
  });

  it("persists the shipment and an append-only event in one transaction", async () => {
    await shipmentService.updateSellerShipment("seller-order-1", "artist-1", {
      status: "IN_TRANSIT",
      carrier: "BlueDart",
      trackingNumber: "BD123",
    });

    expect(mocks.shipmentUpsert).toHaveBeenCalled();
    expect(mocks.shipmentEventCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ shipmentId: "shipment-1", status: "IN_TRANSIT" }),
    }));
    expect(mocks.sellerOrderUpdate).toHaveBeenCalledWith({ where: { id: "seller-order-1" }, data: { status: "IN_TRANSIT" } });
  });

  it("rejects backward shipment transitions", async () => {
    mocks.sellerOrderFindFirst.mockResolvedValue({ id: "seller-order-1", status: "SHIPPED", shipment: { status: "IN_TRANSIT" } });

    await expect(shipmentService.updateSellerShipment("seller-order-1", "artist-1", { status: "LABEL_CREATED" }))
      .rejects.toThrow("Shipment status cannot move backwards");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("processes a provider event once and ignores a duplicate event id", async () => {
    const input = {
      eventId: "provider-event-1",
      sellerOrderId: "seller-order-1",
      status: "DELIVERED" as const,
      occurredAt: new Date("2026-08-25T10:00:00.000Z"),
    };
    mocks.shipmentUpsert.mockResolvedValue({ id: "shipment-1", status: "DELIVERED" });

    await expect(shipmentService.handleProviderEvent(input)).resolves.toMatchObject({ handled: true, reason: "processed" });
    expect(mocks.shipmentEventCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ providerEventId: "provider-event-1" }) }));

    mocks.shipmentEventFindUnique.mockResolvedValue({ id: "event-existing" });
    await expect(shipmentService.handleProviderEvent(input)).resolves.toEqual({ handled: false, reason: "duplicate" });
    expect(mocks.shipmentEventCreate).toHaveBeenCalledTimes(1);
  });
});
