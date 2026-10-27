import type { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoCollections, seedCollections } from "../../prisma/collection-content";
import { demoArtists, demoId } from "../../prisma/demo-content";
import { urlArtworks } from "../../prisma/url-content";

afterEach(() => vi.unstubAllEnvs());

describe("development collections", () => {
  it("groups the catalog into 20 populated category collections with member covers", () => {
    expect(demoCollections).toHaveLength(20);
    const featured = demoCollections.filter((collection) => collection.featured);
    expect(featured.map((collection) => collection.name)).toEqual([
      "Paintings: Quiet Encounters",
      "Ceramics: Stories in Clay",
      "Textiles: Stitched Observations",
    ]);
    expect(featured.every((collection) => collection.ownerEmail === null)).toBe(true);
    expect(new Set(demoCollections.map((collection) => collection.id)).size).toBe(20);
    expect(new Set(demoCollections.map((collection) => collection.name)).size).toBe(20);
    const members = demoCollections.flatMap((collection) => collection.productIds);
    expect(new Set(members).size).toBe(members.length);
    expect(demoCollections.filter((collection) => collection.ownerEmail !== null)).toHaveLength(7);
    expect(demoCollections.filter((collection) => collection.ownerEmail === null)).toHaveLength(13);
    for (const collection of demoCollections) {
      expect(collection.productIds.length).toBeGreaterThan(0);
      const artworks = collection.productIds.map((id) => urlArtworks.find((_, index) => demoId(3000000 + index) === id));
      expect(artworks.every((artwork) => artwork?.category === collection.category)).toBe(true);
      if (collection.ownerEmail) {
        expect(artworks.every((artwork) => artwork && demoArtists[artwork.artist].email === collection.ownerEmail)).toBe(true);
      }
      expect(artworks.some((artwork) => artwork?.image === collection.coverImage)).toBe(true);
      expect(new URL(collection.coverImage).protocol).toBe("https:");
    }
    expect(new Set(demoCollections.map((collection) => collection.category)).size).toBe(7);
  });

  it("rejects production before accessing persistence", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const prisma = { $transaction: vi.fn() };
    await expect(seedCollections(prisma as unknown as PrismaClient)).rejects.toThrow("must not run in production");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("preserves a collection owned by an unexpected artist", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const upsert = vi.fn();
    const tx = {
      collection: { findUnique: vi.fn().mockResolvedValue({ ownerArtistId: "another-artist" }), upsert },
    };
    const prisma = { $transaction: vi.fn((operation: (client: typeof tx) => Promise<void>) => operation(tx)) };
    await expect(seedCollections(prisma as unknown as PrismaClient)).rejects.toThrow("cannot replace an artist-owned collection");
    expect(upsert).not.toHaveBeenCalled();
  });
});
