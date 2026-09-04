import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  collectionFindMany: vi.fn(),
  collectionFindFirst: vi.fn(),
  collectionCreate: vi.fn(),
  collectionUpdate: vi.fn(),
  collectionUpdateMany: vi.fn(),
  productCount: vi.fn(),
  collectionItemDeleteMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    collection: {
      findMany: mocks.collectionFindMany,
      findFirst: mocks.collectionFindFirst,
      create: mocks.collectionCreate,
      update: mocks.collectionUpdate,
      updateMany: mocks.collectionUpdateMany,
    },
    product: { count: mocks.productCount },
    $transaction: mocks.transaction,
  },
}));

import { collectionService } from "@/lib/services/collection.service";

const artist = { id: "cmartistabcdefghijklmnop" };
const persistedCollection = {
  id: "cmcollectionabcdefghijklmn",
  name: "Quiet Materials",
  description: "Texture-led works.",
  coverImage: "https://example.com/collection.jpg",
  published: false,
  _count: { items: 1 },
  items: [{ product: { id: "cmproductabcdefghijklmnop", title: "Study", stock: 1, isActive: true, images: [] } }],
};

describe("artist collection service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.artistFindUnique.mockResolvedValue(artist);
    mocks.collectionFindMany.mockResolvedValue([persistedCollection]);
    mocks.collectionFindFirst.mockResolvedValue({ id: persistedCollection.id });
    mocks.collectionCreate.mockResolvedValue({ id: persistedCollection.id });
    mocks.productCount.mockResolvedValue(1);
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      collectionItem: { deleteMany: mocks.collectionItemDeleteMany },
      collection: { update: mocks.collectionUpdate },
    }));
    mocks.collectionUpdate.mockResolvedValue({ id: persistedCollection.id });
  });

  it("accepts only active products owned by the artist", async () => {
    const result = await collectionService.createForArtist("artist-user", {
      name: "Quiet Materials",
      description: "Texture-led works.",
      coverImage: "https://example.com/collection.jpg",
      productIds: ["cmproductabcdefghijklmnop"],
    });

    expect(result).toMatchObject({ id: persistedCollection.id, artworkCount: 1 });
    expect(mocks.productCount).toHaveBeenCalledWith({
      where: { id: { in: ["cmproductabcdefghijklmnop"] }, artistId: artist.id, isActive: true },
    });
  });

  it("rejects duplicate or foreign artwork IDs before writing a collection", async () => {
    await expect(collectionService.createForArtist("artist-user", {
      name: "Quiet Materials",
      description: "Texture-led works.",
      coverImage: "https://example.com/collection.jpg",
      productIds: ["cmproductabcdefghijklmnop", "cmproductabcdefghijklmnop"],
    })).rejects.toThrow("same artwork twice");
    expect(mocks.collectionCreate).not.toHaveBeenCalled();

    mocks.productCount.mockResolvedValue(0);
    await expect(collectionService.createForArtist("artist-user", {
      name: "Foreign Works",
      description: "Not owned.",
      coverImage: "https://example.com/collection.jpg",
      productIds: ["cmforeignproductabcdefghij"],
    })).rejects.toThrow("only your active artworks");
    expect(mocks.collectionCreate).not.toHaveBeenCalled();
  });

  it("updates items transactionally only after owner scoping", async () => {
    await expect(collectionService.updateForArtist("artist-user", persistedCollection.id, {
      productIds: ["cmproductabcdefghijklmnop"],
    })).resolves.toMatchObject({ id: persistedCollection.id });

    expect(mocks.collectionFindFirst).toHaveBeenCalledWith({
      where: { id: persistedCollection.id, ownerArtist: { userId: "artist-user" } },
      select: { id: true },
    });
    expect(mocks.collectionItemDeleteMany).toHaveBeenCalledWith({ where: { collectionId: persistedCollection.id } });
  });

  it("archives only the owner-scoped collection", async () => {
    mocks.collectionUpdateMany.mockResolvedValue({ count: 1 });
    await expect(collectionService.archiveForArtist("artist-user", persistedCollection.id)).resolves.toBe(true);
    expect(mocks.collectionUpdateMany).toHaveBeenCalledWith({
      where: { id: persistedCollection.id, ownerArtist: { userId: "artist-user" } },
      data: { published: false },
    });
  });
});
