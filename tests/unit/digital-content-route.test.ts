import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  verifyDigitalDownloadToken: vi.fn(),
  downloadDigitalDelivery: vi.fn(),
  digitalAssetUrl: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {},
}));
vi.mock("@/lib/services/post-purchase.service", () => ({
  verifyDigitalDownloadToken: mocks.verifyDigitalDownloadToken,
  downloadDigitalDelivery: mocks.downloadDigitalDelivery,
  digitalAssetUrl: mocks.digitalAssetUrl,
  postPurchaseService: { downloadDigitalDelivery: mocks.downloadDigitalDelivery },
}));

import { GET } from "@/app/api/orders/[id]/digital-delivery/[itemId]/content/route";

const orderId = "cmabcdefghijklmnopqrstuvwx";
const itemId = "cmhijklmnopqrstuvwxabcdef";

describe("digital content access route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    mocks.verifyDigitalDownloadToken.mockReturnValue(true);
    mocks.downloadDigitalDelivery.mockResolvedValue({ assetReference: "provider-key", status: "DOWNLOADED" });
    mocks.digitalAssetUrl.mockReturnValue("https://cdn.example.com/provider-key");
  });

  it("redirects only after verifying the signed token and buyer ownership", async () => {
    const response = await GET(
      new NextRequest(`https://artistically.example/api/orders/${orderId}/digital-delivery/${itemId}/content?token=signed-token`),
      { params: Promise.resolve({ id: orderId, itemId }) },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://cdn.example.com/provider-key");
    expect(mocks.verifyDigitalDownloadToken).toHaveBeenCalledWith("signed-token", { orderId, orderItemId: itemId, userId: "buyer-1" });
  });

  it("rejects a missing token before reading the asset reference", async () => {
    const response = await GET(
      new NextRequest(`https://artistically.example/api/orders/${orderId}/digital-delivery/${itemId}/content`),
      { params: Promise.resolve({ id: orderId, itemId }) },
    );
    expect(response.status).toBe(400);
    expect(mocks.downloadDigitalDelivery).not.toHaveBeenCalled();
  });
});
