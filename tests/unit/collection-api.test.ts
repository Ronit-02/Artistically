import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiRequest: vi.fn() };
});

import { fetchCollectionById, fetchCollections } from "@/lib/api/collections";

const mockedApiRequest = vi.mocked(apiRequest);

const collectionDto = {
  id: "cmabcdefghijklmnopqrstuvwx",
  name: "Chromatic Dreams",
  description: "Bold colour and abstract expression.",
  coverImage: "/paintings/painting-2.jpg",
  featured: true,
  published: true,
  artworkCount: 1,
  ownerArtist: null,
};

const productDto = {
  id: "cm0000000000000000000001",
  title: "Abstract Floral Art",
  description: "A persisted artwork.",
  price: 1725,
  originalPrice: null,
  discount: null,
  category: "PAINTINGS",
  badge: null,
  stock: 1,
  artist: {
    id: "cmartistabcdefghijklmnop",
    handle: "@artist",
    verified: false,
    user: { firstName: "A", lastName: "Artist", avatar: null },
  },
  images: [{ url: "/paintings/painting-1.jpg", isPrimary: true, sortOrder: 0 }],
  rating: 0,
  reviewCount: 0,
};

describe("collection API mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps persisted collection metadata", async () => {
    mockedApiRequest.mockResolvedValueOnce([collectionDto]);

    await expect(fetchCollections()).resolves.toEqual([{
      id: collectionDto.id,
      name: collectionDto.name,
      description: collectionDto.description,
      coverImage: collectionDto.coverImage,
      artworkCount: collectionDto.artworkCount,
      featured: true,
    }]);
  });

  it("maps persisted collection members into product cards", async () => {
    mockedApiRequest.mockResolvedValueOnce({ ...collectionDto, products: [productDto] });

    await expect(fetchCollectionById(collectionDto.id)).resolves.toMatchObject({
      id: collectionDto.id,
      products: [{ id: productDto.id, title: productDto.title, artistName: "A Artist" }],
    });
  });

  it("returns null only for a not-found response", async () => {
    mockedApiRequest.mockRejectedValueOnce(new ApiClientError("Not found", 404));

    await expect(fetchCollectionById(collectionDto.id)).resolves.toBeNull();
  });

  it("rethrows retryable collection failures", async () => {
    const error = new ApiClientError("Service unavailable", 503);
    mockedApiRequest.mockRejectedValueOnce(error);

    await expect(fetchCollectionById(collectionDto.id)).rejects.toBe(error);
  });
});
