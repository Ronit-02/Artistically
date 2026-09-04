import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  reportFindUnique: vi.fn(),
  appealCreate: vi.fn(),
  appealFindUnique: vi.fn(),
  appealUpdate: vi.fn(),
  productUpdate: vi.fn(),
  collectionUpdate: vi.fn(),
  eventCreate: vi.fn(),
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
    report: { findUnique: mocks.reportFindUnique },
    moderationAppeal: { create: mocks.appealCreate, findUnique: mocks.appealFindUnique, update: mocks.appealUpdate },
    product: { update: mocks.productUpdate },
    collection: { update: mocks.collectionUpdate },
    moderationEvent: { create: mocks.eventCreate },
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({
      moderationAppeal: { create: mocks.appealCreate, update: mocks.appealUpdate },
      product: { update: mocks.productUpdate },
      collection: { update: mocks.collectionUpdate },
      moderationEvent: { create: mocks.eventCreate },
    })),
  },
}));

import { POST } from "@/app/api/reports/[id]/appeal/route";
import { PATCH } from "@/app/api/admin/appeals/[id]/route";

const reportId = "cmabcdefghijklmnopqrstuvwx";
const appealId = "cmhijklmnopqrstuvwxabcdef";

function request(body: unknown, method = "POST") {
  return new NextRequest(`https://artistically.example/api/reports/${reportId}/appeal`, {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("moderation appeal routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user-1", role: "ARTIST" });
    mocks.reportFindUnique.mockResolvedValue({
      id: reportId,
      status: "RESOLVED",
      appeal: null,
      product: { artist: { userId: "artist-user-1" } },
      collection: null,
    });
    mocks.appealCreate.mockResolvedValue({ id: appealId, reportId, status: "OPEN", statement: "This listing is authentic and the report is mistaken." });
    mocks.appealFindUnique.mockResolvedValue({
      id: appealId,
      reportId,
      status: "OPEN",
      report: { productId: "cmabcdefghijklmnopqrstuvwx", collectionId: null },
    });
    mocks.appealUpdate.mockResolvedValue({ id: appealId, status: "APPROVED" });
  });

  it("allows only the affected owner to submit one appeal", async () => {
    const response = await POST(request({ statement: "This listing is authentic and the report is mistaken." }), {
      params: Promise.resolve({ id: reportId }),
    });

    expect(response.status).toBe(201);
    expect(mocks.appealCreate).toHaveBeenCalledWith({
      data: { reportId, appellantId: "artist-user-1", statement: "This listing is authentic and the report is mistaken." },
    });
    expect(mocks.eventCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ appealId, type: "APPEAL_SUBMITTED" }),
    }));
  });

  it("approves an appeal by restoring the affected artwork", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "admin-1", role: "ADMIN" });
    const response = await PATCH(
      new NextRequest(`https://artistically.example/api/admin/appeals/${appealId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "APPROVED", decisionNote: "Evidence accepted." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: appealId }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.productUpdate).toHaveBeenCalledWith({
      where: { id: "cmabcdefghijklmnopqrstuvwx" },
      data: { isActive: true },
    });
    expect(mocks.appealUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reviewerId: "admin-1", status: "APPROVED" }),
    }));
  });
});
