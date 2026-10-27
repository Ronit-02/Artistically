import { describe, expect, it } from "vitest";
import { galleryPhotographs, photographyTopics } from "@/data/photography";
import { ART_TYPES, CATEGORY_LABELS } from "@/lib/catalog-taxonomy";
import { urlArtworks } from "../../prisma/url-content";
import nextConfig from "../../next.config";

describe("noncommercial photography gallery", () => {
  it("keeps the 40 distinct references outside the selling catalog", () => {
    expect(galleryPhotographs).toHaveLength(40);
    expect(new Set(galleryPhotographs.map((photo) => photo.image)).size).toBe(40);
    expect(new Set(galleryPhotographs.map((photo) => photo.id)).size).toBe(40);
    expect(new Set(galleryPhotographs.map((photo) => photo.title)).size).toBe(40);
    expect(ART_TYPES).not.toContain("Photography");
    expect(CATEGORY_LABELS).not.toContain("Photography");
    const catalogImages = new Set(urlArtworks.map((artwork) => artwork.image));
    for (const photo of galleryPhotographs) {
      expect(Object.keys(photo).sort()).toEqual(["caption", "height", "id", "image", "title", "topic", "width"]);
      expect(catalogImages.has(photo.image)).toBe(false);
      expect(photographyTopics).toContain(photo.topic);
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
      expect(photo.caption.length).toBeGreaterThan(40);
    }
  });

  it("allows the image origins within the installed optimizer limit", async () => {
    const headers = await nextConfig.headers?.();
    const policy = headers?.flatMap((entry) => entry.headers).find((header) => header.key === "Content-Security-Policy")?.value;
    const imagePolicy = policy?.split(";").find((directive) => directive.trim().startsWith("img-src "))?.split(/\s+/);
    expect(nextConfig.images?.remotePatterns?.length).toBeLessThanOrEqual(50);
    for (const photo of galleryPhotographs) {
      const url = new URL(photo.image);
      expect(url.protocol).toBe("https:");
      expect(imagePolicy).toContain(url.origin);
    }
  });
});
