import { describe, expect, it } from "vitest";
import { createDigitalDownloadToken, digitalAssetUrl, verifyDigitalDownloadToken } from "@/lib/services/post-purchase.service";

const access = { orderId: "cmabcdefghijklmnopqrstuvwx", orderItemId: "cmhijklmnopqrstuvwxabcdef", userId: "buyer-1" };

describe("digital delivery access tokens", () => {
  it("accepts a token only for its order item and buyer", () => {
    const token = createDigitalDownloadToken(access);
    expect(verifyDigitalDownloadToken(token, access)).toBe(true);
    expect(verifyDigitalDownloadToken(token, { ...access, userId: "buyer-2" })).toBe(false);
    expect(verifyDigitalDownloadToken(`${token}tampered`, access)).toBe(false);
  });

  it("accepts HTTPS provider URLs and rejects unconfigured object keys", () => {
    expect(digitalAssetUrl("https://cdn.example.com/artwork.zip")).toBe("https://cdn.example.com/artwork.zip");
    expect(() => digitalAssetUrl("artist-1/artwork.zip")).toThrow("Digital asset provider is not configured");
  });
});
