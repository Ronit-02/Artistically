import { describe, expect, it } from "vitest";
import { CreateArtistSubmissionSchema, CreateMediaUploadSchema } from "@/lib/validators";

describe("provider-backed artist media contracts", () => {
  it("accepts image upload metadata and rejects a non-image artwork upload", () => {
    expect(CreateMediaUploadSchema.parse({ purpose: "ARTWORK_IMAGE", fileName: "work.jpg", mimeType: "image/jpeg", sizeBytes: 1024 })).toMatchObject({ purpose: "ARTWORK_IMAGE" });
    expect(() => CreateMediaUploadSchema.parse({ purpose: "ARTWORK_IMAGE", fileName: "work.exe", mimeType: "application/octet-stream", sizeBytes: 1024 })).toThrow();
  });

  it("requires a private digital asset only for digital submissions", () => {
    const base = { title: "A complete work", price: 1000, category: "PAINTINGS", stock: 1, imageAssetIds: ["asset-123456789"], artworkDetails: { artworkType: "DIGITAL", fulfillmentMode: "DIGITAL", medium: "Digital" } } as const;
    expect(() => CreateArtistSubmissionSchema.parse(base)).toThrow(/digitalAssetId/);
    expect(CreateArtistSubmissionSchema.parse({ ...base, digitalAssetId: "asset-987654321" }).digitalAssetId).toBe("asset-987654321");
    expect(() => CreateArtistSubmissionSchema.parse({ ...base, artworkDetails: { artworkType: "ORIGINAL", fulfillmentMode: "PHYSICAL", medium: "Oil", width: 10, height: 10 }, digitalAssetId: "asset-987654321" })).toThrow();
  });
});
