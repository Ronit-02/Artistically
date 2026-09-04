import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  productFindUnique: vi.fn(),
  collectionFindUnique: vi.fn(),
  reportFindFirst: vi.fn(),
  reportCreate: vi.fn(),
  reportFindUnique: vi.fn(),
  reportUpdate: vi.fn(),
  moderationEventCreate: vi.fn(),
  productUpdate: vi.fn(),
  collectionUpdate: vi.fn(),
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
    product: { findUnique: mocks.productFindUnique, update: mocks.productUpdate },
    collection: { findUnique: mocks.collectionFindUnique, update: mocks.collectionUpdate },
    report: {
      findFirst: mocks.reportFindFirst,
      create: mocks.reportCreate,
      findUnique: mocks.reportFindUnique,
      update: mocks.reportUpdate,
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({
      product: { update: mocks.productUpdate },
      collection: { update: mocks.collectionUpdate },
      report: { create: mocks.reportCreate, update: mocks.reportUpdate },
      moderationEvent: { create: mocks.moderationEventCreate },
    })),
  },
}));

import { POST } from "@/app/api/reports/route";
import { PATCH } from "@/app/api/admin/reports/[id]/route";

const productId = "cmabcdefghijklmnopqrstuvwx";
const reportId = "cmhijklmnopqrstuvwxabcdef";

function request(body: unknown, url = "https://artistically.example/api/reports", method = "POST") {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("moderation report routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "collector-1", role: "USER" });
    mocks.productFindUnique.mockResolvedValue({ id: productId, isActive: true });
    mocks.reportFindFirst.mockResolvedValue(null);
    mocks.reportCreate.mockResolvedValue({
      id: reportId,
      reason: "COPYRIGHT",
      details: "Please review the listing provenance.",
      status: "OPEN",
      productId,
      collectionId: null,
      createdAt: new Date("2026-08-24T00:00:00.000Z"),
    });
    mocks.reportFindUnique.mockResolvedValue({
      id: reportId,
      status: "OPEN",
      productId,
      collectionId: null,
    });
    mocks.reportUpdate.mockResolvedValue({ id: reportId, status: "RESOLVED", productId });
  });

  it("creates an open report for an active artwork", async () => {
    const response = await POST(request({
      targetType: "PRODUCT",
      targetId: productId,
      reason: "COPYRIGHT",
      details: "Please review the listing provenance.",
    }));

    expect(response.status).toBe(201);
    expect(mocks.reportCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reporterId: "collector-1", productId, reason: "COPYRIGHT" }),
    }));
    expect(mocks.moderationEventCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reportId, actorId: "collector-1", type: "REPORT_CREATED" }),
    }));
  });

  it("rejects a duplicate open report from the same user", async () => {
    mocks.reportFindFirst.mockResolvedValue({ id: "existing-report" });

    const response = await POST(request({ targetType: "PRODUCT", targetId: productId, reason: "OTHER" }));

    expect(response.status).toBe(409);
    expect(mocks.reportCreate).not.toHaveBeenCalled();
  });

  it("resolves an artwork report by deactivating the artwork in one transaction", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "admin-1", role: "ADMIN" });

    const response = await PATCH(
      request(
        { status: "RESOLVED", action: "REMOVE_PRODUCT", resolutionNote: "Removed after review." },
        `https://artistically.example/api/admin/reports/${reportId}`,
        "PATCH",
      ),
      { params: Promise.resolve({ id: reportId }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.productUpdate).toHaveBeenCalledWith({ where: { id: productId }, data: { isActive: false } });
    expect(mocks.reportUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: reportId },
      data: expect.objectContaining({ reviewerId: "admin-1", status: "RESOLVED" }),
    }));
  });
});
