import type { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedUrlContent, urlArtworks } from "../../prisma/url-content";
import { demoArtists } from "../../prisma/demo-content";
import nextConfig from "../../next.config";

afterEach(() => vi.unstubAllEnvs());

describe("URL-backed artwork catalog", () => {
  it("keeps earlier catalog positions while adding 23 paintings with exact integer discounts", () => {
    expect(urlArtworks).toHaveLength(217);
    expect(urlArtworks.filter((artwork) => artwork.category === "PAINTINGS")).toHaveLength(30);
    expect(urlArtworks.slice(194).every((artwork) => artwork.category === "PAINTINGS")).toBe(true);
    expect(urlArtworks[7].category).toBe("DIGITAL_ART");
    expect(urlArtworks[31].category).toBe("SCULPTURES");
    expect(urlArtworks[193].category).toBe("TEXTILE");
    expect(urlArtworks.filter((artwork) => artwork.category === "DIGITAL_ART")).toHaveLength(24);
    expect(urlArtworks.filter((artwork) => artwork.category === "SCULPTURES")).toHaveLength(24);
    expect(urlArtworks.filter((artwork) => artwork.category === "WOODWORK")).toHaveLength(24);
    expect(urlArtworks.filter((artwork) => artwork.category === "CERAMICS")).toHaveLength(38);
    expect(urlArtworks.filter((artwork) => artwork.category === "GLASS_ART")).toHaveLength(31);
    expect(urlArtworks.filter((artwork) => artwork.category === "TEXTILE")).toHaveLength(46);
    expect(new Set(urlArtworks.map((artwork) => artwork.image)).size).toBe(217);
    expect(new Set(urlArtworks.map((artwork) => artwork.title)).size).toBe(217);
    expect(nextConfig.images?.remotePatterns?.length).toBeLessThanOrEqual(50);
    for (const artwork of urlArtworks) {
      const url = new URL(artwork.image);
      expect(url.protocol).toBe("https:");
      expect(nextConfig.images?.remotePatterns?.some((pattern) => {
        const protocol = pattern instanceof URL ? `${pattern.protocol.slice(0, -1)}:` : `${pattern.protocol}:`;
        return protocol === url.protocol && pattern.hostname === url.hostname
          && (pattern.search === undefined || pattern.search === url.search)
          && url.pathname.startsWith(pattern.pathname?.replace(/\*+$/, "") ?? "/");
      })).toBe(true);
      expect(demoArtists[artwork.artist]).toBeDefined();
      const price = artwork.originalRupees * (100 - artwork.discount);
      expect(Number.isSafeInteger(price)).toBe(true);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(artwork.originalRupees * 100);
      expect(artwork.description.length).toBeGreaterThan(50);
    }
  });

  it("rejects replacement before deletion when orders exist", async () => {
    vi.stubEnv("REPLACE_CATALOG", "true");
    const tx = { orderItem: { count: vi.fn().mockResolvedValue(1) }, collection: { deleteMany: vi.fn() } };
    const prisma = { $transaction: vi.fn((operation: (client: typeof tx) => Promise<void>) => operation(tx)) };
    await expect(seedUrlContent(prisma as unknown as PrismaClient)).rejects.toThrow("without order items");
    expect(tx.collection.deleteMany).not.toHaveBeenCalled();
  });

  it("seeds three sold-out selling products per category and keeps the rest available", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("REPLACE_CATALOG", "false");
    const upsertProduct = vi.fn().mockResolvedValue({});
    const tx = {
      user: { upsert: vi.fn().mockResolvedValue({ id: "demo-user" }) },
      artist: { upsert: vi.fn().mockResolvedValue({ id: "demo-artist" }) },
      product: { upsert: upsertProduct },
    };
    const prisma = { $transaction: vi.fn((operation: (client: typeof tx) => Promise<void>) => operation(tx)) };

    await seedUrlContent(prisma as unknown as PrismaClient);

    expect(upsertProduct).toHaveBeenCalledTimes(urlArtworks.length);
    const counts = new Map<string, { sold: number; available: number }>();
    for (const [input] of upsertProduct.mock.calls as [{ create: { category: string; badge: null; stock: number; description: string }; update: { category: string; badge: null; stock: number; description: string } }][]) {
      for (const listing of [input.create, input.update]) {
        expect(listing.badge).toBeNull();
        expect([0, 1]).toContain(listing.stock);
        expect(listing.description).not.toMatch(/not.*sale|reference only/i);
      }
      expect(input.update.stock).toBe(input.create.stock);
      const categoryCounts = counts.get(input.create.category) ?? { sold: 0, available: 0 };
      if (input.create.stock === 0) {categoryCounts.sold += 1;}
      else {categoryCounts.available += 1;}
      counts.set(input.create.category, categoryCounts);
    }
    expect(counts.size).toBe(7);
    for (const [category, categoryCounts] of counts) {
      expect(categoryCounts.sold).toBe(3);
      expect(categoryCounts.available).toBe(urlArtworks.filter((artwork) => artwork.category === category).length - 3);
    }
  });

  it("blocks production seeding before accessing the database", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const prisma = { $transaction: vi.fn() };
    await expect(seedUrlContent(prisma as unknown as PrismaClient)).rejects.toThrow("must not run in production");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
