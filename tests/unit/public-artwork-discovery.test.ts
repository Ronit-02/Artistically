import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  list: vi.fn(), requireAuth: vi.fn(), artistFindUnique: vi.fn(), artistFindMany: vi.fn(),
  wishlistFindMany: vi.fn(), collectionFindMany: vi.fn(), collectionFindFirst: vi.fn(),
  getProduct: vi.fn(), productFindMany: vi.fn(), storyFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: {
  artist: { findUnique: mocks.artistFindUnique, findMany: mocks.artistFindMany },
  wishlistItem: { findMany: mocks.wishlistFindMany },
  collection: { findMany: mocks.collectionFindMany, findFirst: mocks.collectionFindFirst },
  product: { findMany: mocks.productFindMany },
  story: { findMany: mocks.storyFindMany },
} }));
vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {},
}));
vi.mock("@/lib/services/product.service", () => ({ productService: { list: mocks.list, getById: mocks.getProduct } }));

import { GET as getProducts } from "@/app/api/products/route";
import { GET as getArtist } from "@/app/api/artists/[id]/route";
import { GET as getArtists } from "@/app/api/artists/route";
import { GET as getWishlist } from "@/app/api/wishlist/route";
import { collectionService } from "@/lib/services/collection.service";
import { metadataService } from "@/lib/services/metadata.service";
import sitemap from "@/app/sitemap";
import { BROWSE_PRODUCT_WHERE } from "@/lib/product-visibility";
import { AuthError } from "@/lib/auth";

const artistId = "cmabcdefghijklmnopqrstuvwx";
const request = (query = "") => new NextRequest(`https://artistically.example/api/products${query}`);

describe("sold inclusion API boundaries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.list.mockResolvedValue({ products: [], total: 0 });
  });

  it("keeps catalog browsing public and excludes sold records by default", async () => {
    expect((await getProducts(request())).status).toBe(200);
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ includeSold: false }));
    expect(mocks.requireAuth).not.toHaveBeenCalled();
  });

  it("allows sold matches for a public submitted text search", async () => {
    expect((await getProducts(request("?includeSold=true&search=%20study%20"))).status).toBe(200);
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ includeSold: true, search: "study" }));
    expect(mocks.requireAuth).not.toHaveBeenCalled();
  });

  it("allows public category-filtered sold matches without search text", async () => {
    expect((await getProducts(request("?includeSold=true&search=%20%20&category=PAINTINGS&category=CERAMICS"))).status).toBe(200);
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ includeSold: true, categories: ["PAINTINGS", "CERAMICS"] }));
    expect(mocks.requireAuth).not.toHaveBeenCalled();
  });

  it("does not let whitespace alone bypass the inventory guard", async () => {
    mocks.requireAuth.mockRejectedValue(new AuthError());
    expect((await getProducts(request("?includeSold=true&search=%20%20"))).status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("rejects unsupported categories before permitting sold inclusion", async () => {
    expect((await getProducts(request("?includeSold=true&category=INVALID"))).status).toBe(400);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("rejects another artist's inventory and unscoped collector reads", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.artistFindUnique.mockResolvedValue({ id: "cmanotherartistabcdefghijkl" });
    expect((await getProducts(request(`?includeSold=true&artistId=${artistId}`))).status).toBe(403);
    mocks.artistFindUnique.mockResolvedValue(null);
    expect((await getProducts(request("?includeSold=true"))).status).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("allows the owning artist and administrator to read sold inventory", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.artistFindUnique.mockResolvedValue({ id: artistId });
    expect((await getProducts(request(`?includeSold=true&artistId=${artistId}`))).status).toBe(200);
    mocks.requireAuth.mockResolvedValue({ userId: "admin-user", role: "ADMIN" });
    expect((await getProducts(request("?includeSold=true"))).status).toBe(200);
  });
});

describe("other artwork discovery queries", () => {
  beforeEach(() => vi.resetAllMocks());

  it("filters artist artwork lists and counts with the same visibility rule", async () => {
    mocks.artistFindUnique.mockResolvedValue({ id: artistId, verification: null });
    mocks.artistFindMany.mockResolvedValue([]);
    await getArtist(request(), { params: Promise.resolve({ id: artistId }) });
    await getArtists(request());
    expect(mocks.artistFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({
        products: expect.objectContaining({ where: BROWSE_PRODUCT_WHERE }),
        _count: { select: { products: { where: BROWSE_PRODUCT_WHERE }, followers: true } },
      }),
    }));
    expect(mocks.artistFindMany).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({ _count: { select: { products: { where: BROWSE_PRODUCT_WHERE }, followers: true } } }),
    }));
  });

  it("hides sold wishlist entries without deleting saved records", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "collector" });
    mocks.wishlistFindMany.mockResolvedValue([]);
    expect((await getWishlist(request())).status).toBe(200);
    expect(mocks.wishlistFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "collector", product: BROWSE_PRODUCT_WHERE },
    }));
  });

  it("filters collection members and all public collection counts consistently", async () => {
    mocks.collectionFindMany.mockResolvedValue([]);
    mocks.collectionFindFirst.mockResolvedValue(null);
    await collectionService.list();
    await collectionService.getById("collection");
    await metadataService.getCollection("collection");
    const count = { select: { items: { where: { product: BROWSE_PRODUCT_WHERE } } } };
    expect(mocks.collectionFindMany).toHaveBeenCalledWith(expect.objectContaining({ select: expect.objectContaining({ _count: count }) }));
    expect(mocks.collectionFindFirst).toHaveBeenNthCalledWith(1, expect.objectContaining({
      select: expect.objectContaining({ _count: count, items: expect.objectContaining({ where: { product: BROWSE_PRODUCT_WHERE } }) }),
    }));
    expect(mocks.collectionFindFirst).toHaveBeenNthCalledWith(2, expect.objectContaining({ select: expect.objectContaining({ _count: count }) }));
  });

  it("omits sold listing URLs from sitemap discovery", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.artistFindMany.mockResolvedValue([]);
    mocks.storyFindMany.mockResolvedValue([]);
    await sitemap();
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: BROWSE_PRODUCT_WHERE }));
  });
});
