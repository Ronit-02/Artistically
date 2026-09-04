import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  openDispute: vi.fn(),
  listDisputesForUser: vi.fn(),
  resolveDispute: vi.fn(),
  publishDigitalDelivery: vi.fn(),
  downloadDigitalDelivery: vi.fn(),
  prepareDigitalDownload: vi.fn(),
  getDigitalDelivery: vi.fn(),
  listDisputesForAdmin: vi.fn(),
  createDigitalDownloadToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {},
}));
vi.mock("@/lib/services/post-purchase.service", () => ({
  createDigitalDownloadToken: mocks.createDigitalDownloadToken,
  postPurchaseService: {
    openDispute: mocks.openDispute,
    listDisputesForUser: mocks.listDisputesForUser,
    resolveDispute: mocks.resolveDispute,
    publishDigitalDelivery: mocks.publishDigitalDelivery,
    downloadDigitalDelivery: mocks.downloadDigitalDelivery,
    prepareDigitalDownload: mocks.prepareDigitalDownload,
    getDigitalDelivery: mocks.getDigitalDelivery,
    listDisputesForAdmin: mocks.listDisputesForAdmin,
  },
}));

import { POST as openDispute } from "@/app/api/orders/[id]/disputes/route";
import { POST as publishDigitalDelivery } from "@/app/api/artist/order-items/[id]/digital-delivery/route";
import { POST as downloadDigitalDelivery } from "@/app/api/orders/[id]/digital-delivery/[itemId]/route";

const orderId = "cmabcdefghijklmnopqrstuvwx";
const itemId = "cmhijklmnopqrstuvwxabcdef";

describe("post-purchase routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    mocks.openDispute.mockResolvedValue({ id: "dispute-1", status: "OPEN" });
    mocks.publishDigitalDelivery.mockResolvedValue({ id: "delivery-1", status: "AVAILABLE" });
    mocks.downloadDigitalDelivery.mockResolvedValue({ id: "delivery-1", status: "DOWNLOADED", assetReference: "provider-key" });
    mocks.prepareDigitalDownload.mockResolvedValue({ id: "delivery-1", status: "AVAILABLE", downloadCount: 0, downloadLimit: 3 });
    mocks.createDigitalDownloadToken.mockReturnValue("signed-token");
  });

  it("opens a buyer-owned dispute with validated details", async () => {
    const response = await openDispute(
      new NextRequest(`https://artistically.example/api/orders/${orderId}/disputes`, {
        method: "POST",
        body: JSON.stringify({ type: "DAMAGE", reason: "The framed artwork arrived damaged." }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: orderId }) },
    );
    expect(response.status).toBe(201);
    expect(mocks.openDispute).toHaveBeenCalledWith(orderId, "buyer-1", expect.objectContaining({ type: "DAMAGE" }));
  });

  it("keeps digital delivery publishing artist-scoped", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "artist-1", role: "ARTIST" });
    const response = await publishDigitalDelivery(
      new NextRequest(`https://artistically.example/api/artist/order-items/${itemId}/digital-delivery`, {
        method: "POST",
        body: JSON.stringify({ assetReference: "provider-key", downloadLimit: 2 }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: itemId }) },
    );
    expect(response.status).toBe(200);
    expect(mocks.publishDigitalDelivery).toHaveBeenCalledWith(itemId, "artist-1", "provider-key", 2);
  });

  it("requires explicit license acceptance for a digital download", async () => {
    const response = await downloadDigitalDelivery(
      new NextRequest(`https://artistically.example/api/orders/${orderId}/digital-delivery/${itemId}`, {
        method: "POST",
        body: JSON.stringify({ acceptLicense: true }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: orderId, itemId }) },
    );
    expect(response.status).toBe(200);
    expect(mocks.prepareDigitalDownload).toHaveBeenCalledWith(orderId, itemId, "buyer-1", true);
    expect(mocks.createDigitalDownloadToken).toHaveBeenCalled();
  });
});
