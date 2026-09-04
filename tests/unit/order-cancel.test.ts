import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  orderFindFirst: vi.fn(),
  transaction: vi.fn(),
  orderUpdateMany: vi.fn(),
  orderItemFindMany: vi.fn(),
  productUpdate: vi.fn(),
  deliveryRecordCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findFirst: mocks.orderFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { orderService } from "@/lib/services/order.service";
import { InvalidStateError } from "@/lib/domain-errors";

describe("order cancellation concurrency guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderFindFirst.mockResolvedValue({ status: "PROCESSING" });
    mocks.orderUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderItemFindMany.mockResolvedValue([
      { productId: "cm7q1k8l90000abcde1234567", quantity: 2 },
    ]);
    mocks.productUpdate.mockResolvedValue({});
    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        order: { updateMany: mocks.orderUpdateMany },
        orderItem: { findMany: mocks.orderItemFindMany },
        product: { update: mocks.productUpdate },
        deliveryRecord: { create: mocks.deliveryRecordCreate },
      }),
    );
  });

  it("claims cancellation before restoring inventory", async () => {
    await expect(orderService.cancel("cm7q1k8l90000abcde1234567", "user-1"))
      .resolves.toBe(true);

    expect(mocks.orderUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "cm7q1k8l90000abcde1234567",
        userId: "user-1",
        status: { in: ["PROCESSING", "CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    });
    expect(mocks.productUpdate).toHaveBeenCalledTimes(1);
  });

  it("does not restore inventory when another cancellation wins", async () => {
    mocks.orderUpdateMany.mockResolvedValue({ count: 0 });

    await expect(orderService.cancel("cm7q1k8l90000abcde1234567", "user-1"))
      .rejects.toBeInstanceOf(InvalidStateError);
    expect(mocks.orderItemFindMany).not.toHaveBeenCalled();
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("does not cancel or restore stock for a successfully paid order", async () => {
    mocks.orderFindFirst.mockResolvedValue({ status: "PROCESSING", payment: { status: "SUCCEEDED" } });

    await expect(orderService.cancel("cm7q1k8l90000abcde1234567", "user-1"))
      .rejects.toThrow("Paid orders require a refund workflow before cancellation");
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("does not cancel after the order has entered shipment", async () => {
    mocks.orderFindFirst.mockResolvedValue({ status: "SHIPPED", payment: { status: "PENDING" } });
    await expect(orderService.cancel("cm7q1k8l90000abcde1234567", "user-1")).rejects.toThrow("Order cannot be cancelled at this stage");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
