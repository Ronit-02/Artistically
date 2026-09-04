import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  orderItemFindFirst: vi.fn(),
  reviewFindFirst: vi.fn(),
  reviewCreate: vi.fn(),
  auditLogCreate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orderItem: { findFirst: mocks.orderItemFindFirst },
    review: { findFirst: mocks.reviewFindFirst, create: mocks.reviewCreate },
    auditLog: { create: mocks.auditLogCreate },
  },
}));

import { POST } from "@/app/api/reviews/route";

const productId = "cmabcdefghijklmnopqrstuvwx";

function request() {
  return new NextRequest("https://artistically.example/api/reviews", {
    method: "POST",
    body: JSON.stringify({ productId, rating: 5, text: "A beautiful and carefully made work." }),
    headers: { "content-type": "application/json" },
  });
}

describe("review creation eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "collector-1", role: "USER" });
    mocks.orderItemFindFirst.mockResolvedValue({ id: "order-item-1" });
    mocks.reviewFindFirst.mockResolvedValue(null);
    mocks.reviewCreate.mockResolvedValue({
      id: "review-1",
      productId,
      orderItemId: "order-item-1",
      rating: 5,
      text: "A beautiful and carefully made work.",
      user: { firstName: "Asha", lastName: "Rao", avatar: null },
    });
    mocks.auditLogCreate.mockResolvedValue({});
  });

  it("rejects reviews without a delivered purchase", async () => {
    mocks.orderItemFindFirst.mockResolvedValue(null);

    const response = await POST(request());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "You can review artwork only after a delivered purchase",
    });
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it("requires a delivered order for the authenticated buyer and excludes the listing owner", async () => {
    await POST(request());

    expect(mocks.orderItemFindFirst).toHaveBeenCalledWith({
      where: {
        productId,
        order: { userId: "collector-1" },
        OR: [
          { fulfillmentStatus: "DELIVERED" },
          { order: { status: "DELIVERED" } },
        ],
        product: { artist: { userId: { not: "collector-1" } } },
      },
      select: { id: true },
    });
  });

  it("creates the review only after eligibility succeeds", async () => {
    const response = await POST(request());
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({ id: "review-1", productId, rating: 5, verified: true });
    expect(mocks.reviewCreate).toHaveBeenCalledWith({
      data: { productId, userId: "collector-1", rating: 5, text: "A beautiful and carefully made work.", orderItemId: "order-item-1" },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });
  });

  it("rejects a second review for the same artwork by the same buyer", async () => {
    mocks.reviewFindFirst.mockResolvedValue({ id: "review-existing" });

    const response = await POST(request());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "You have already reviewed this artwork",
    });
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });
});
