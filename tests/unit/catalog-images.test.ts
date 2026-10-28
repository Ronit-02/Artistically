import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { catalogImageCandidates, catalogImageUrl, type CatalogImageEntry } from "../../src/lib/catalog-images";
import { IMAGE_PLACEHOLDER } from "../../src/lib/image-placeholder";
import { catalogFolder, convertCatalogImage, readBoundedImage } from "../../scripts/migrate-catalog-images";
import manifest from "../../src/data/catalog-image-manifest.json";
import { urlArtworks } from "../../prisma/url-content";

const entry: CatalogImageEntry = {
  productId: "example-id", originalUrl: "https://source.example/art.jpg", url: "https://ik.imagekit.io/example/art.webp",
  fileId: "file-id", filePath: "/art.webp", checksum: "example-checksum", width: 80, height: 40, sizeBytes: 100,
};

describe("catalog image delivery", () => {
  it("covers every fixture with a bounded WebP replica and preserves original sources", () => {
    expect(manifest.images).toHaveLength(urlArtworks.length);
    expect(new Set(manifest.images.map((image) => image.originalUrl))).toEqual(new Set(urlArtworks.map((artwork) => artwork.image)));
    expect(new Set(manifest.images.map((image) => image.fileId)).size).toBe(manifest.images.length);
    for (const image of manifest.images) {
      expect(image.url).toMatch(/^https:\/\/ik\.imagekit\.io\/.+\/artistically\/demo\/artworks\/.+\.webp$/);
      expect(image.sizeBytes).toBeLessThanOrEqual(500_000);
      expect(image.checksum).toMatch(/^[a-f0-9]{64}$/);
      expect(catalogImageUrl(image.originalUrl)).toBe(image.url);
    }
  });
  it("tries hosted image, original source, then placeholder without duplicate retries", () => {
    expect(catalogImageCandidates(entry.originalUrl, entry)).toEqual([entry.url, entry.originalUrl, IMAGE_PLACEHOLDER]);
    expect(catalogImageCandidates(entry.url, entry)).toEqual([entry.url, entry.originalUrl, IMAGE_PLACEHOLDER]);
    expect(catalogImageCandidates(IMAGE_PLACEHOLDER)).toEqual([IMAGE_PLACEHOLDER]);
  });

  it("leaves unmigrated and newly changed URLs usable", () => {
    const source = "https://source.example/new.jpg";
    expect(catalogImageUrl(source)).toBe(source);
    expect(catalogImageCandidates(source)).toEqual([source, IMAGE_PLACEHOLDER]);
  });

  it("uses product identity to separate folders with identical or unsafe titles", () => {
    expect(catalogFolder("one", "../../Same artwork")).toBe("/artistically/demo/artworks/one-same-artwork");
    expect(catalogFolder("two", "Same artwork")).not.toBe(catalogFolder("one", "Same artwork"));
  });

  it("converts real image bytes to WebP without upscaling or cropping", async () => {
    const source = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#805020" } }).png().toBuffer();
    const converted = await convertCatalogImage(source);
    const result = await sharp(converted.content).metadata();
    expect(result.format).toBe("webp");
    expect([converted.width, converted.height]).toEqual([80, 40]);
    expect(converted.content.byteLength).toBeLessThanOrEqual(500_000);
  });

  it("rejects non-image content and unsuccessful downloads", async () => {
    await expect(convertCatalogImage(Buffer.from("<html>blocked</html>"))).rejects.toThrow();
    await expect(readBoundedImage(new Response("denied", { status: 403 }))).rejects.toThrow("403");
    await expect(readBoundedImage(new Response("small", { headers: { "content-length": String(26 * 1024 * 1024) } }))).rejects.toThrow("limit");
  });

  it("accepts AVIF sources decoded by Sharp as HEIF with AV1 compression", async () => {
    const source = await sharp({ create: { width: 80, height: 40, channels: 3, background: "white" } }).avif().toBuffer();
    const converted = await convertCatalogImage(source);
    expect((await sharp(converted.content).metadata()).format).toBe("webp");
    expect([converted.width, converted.height]).toEqual([80, 40]);
  });
});
