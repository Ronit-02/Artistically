import { describe, expect, it, vi } from "vitest";
import { mapCartItem } from "@/lib/api/cart";
import { mapWishlistItem } from "@/lib/api/wishlist";
import { mapStory } from "@/lib/api/stories";
import { mapReview } from "@/lib/api/reviews";
import { mapOrdersToItems } from "@/lib/api/orders";
import { fetchProductById, fetchRelatedProducts } from "@/lib/api/products";
import { ApiClientError } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/client")>()),
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/api/client";

const artist = { user: { firstName: "Asha", lastName: "Rao" } };

describe("cart and wishlist DTO mapping", () => {
  it("keeps cart identity and purchase fields from the API", () => {
    const item = mapCartItem({
      id: "cart-1",
      quantity: 2,
      size: "5×7",
      product: {
        id: "product-1",
        title: "Blue Study",
        price: 240000,
        originalPrice: 300000,
        discount: 20,
        category: "PAINTINGS",
        badge: "LIMITED EDITION",
        stock: 4,
        images: [{ url: "/blue-study.jpg" }],
        artist,
      },
    });

    expect(item).toMatchObject({
      id: "product-1",
      cartItemId: "cart-1",
      quantity: 2,
      stock: 4,
      price: 2400,
      category: "PAINTINGS",
      badge: "LIMITED EDITION",
      artistName: "Asha Rao",
    });
  });

  it("maps wishlist records to product cards", () => {
    const product = mapWishlistItem({
      id: "wish-1",
      createdAt: "2026-08-23T00:00:00.000Z",
      product: {
        id: "product-2",
        title: "Quiet Form",
        price: 180000,
        originalPrice: null,
        discount: null,
        category: "SCULPTURES",
        badge: null,
        images: [{ url: "/quiet-form.jpg" }],
        artist,
      },
    });

    expect(product).toMatchObject({
      id: "product-2",
      title: "Quiet Form",
      image: "/quiet-form.jpg",
      artistName: "Asha Rao",
      category: "SCULPTURES",
    });
  });

  it("keeps editorial story IDs and published content from the API", () => {
    const story = mapStory({
      id: "cm0000000000000000000011",
      title: "Acrylic on Canvas",
      excerpt: "A study of paint and texture.",
      content: "The published story body.",
      image: "/stories/acrylic.jpg",
      category: "Technique",
      date: "2026-08-23T00:00:00.000Z",
    });

    expect(story).toEqual({
      id: "cm0000000000000000000011",
      title: "Acrylic on Canvas",
      date: "2026-08-23T00:00:00.000Z",
      image: "/stories/acrylic.jpg",
      excerpt: "A study of paint and texture.",
      category: "Technique",
      content: "The published story body.",
    });
  });

  it("maps review authors and timestamps for product detail", () => {
    expect(mapReview({
      id: "review-1",
      rating: 4.5,
      text: "Beautiful work.",
      createdAt: "2026-08-23T00:00:00.000Z",
      user: { firstName: "Asha", lastName: "Rao", avatar: null },
    })).toEqual({
      id: "review-1",
      author: "Asha Rao",
      date: "2026-08-23T00:00:00.000Z",
      rating: 4.5,
      text: "Beautiful work.",
    });
  });

  it("maps persisted order lines without losing seller or quantity data", () => {
    expect(mapOrdersToItems([{
      id: "order-1",
      status: "DELIVERED",
      createdAt: "2026-08-23T00:00:00.000Z",
      subtotal: 250000,
      shippingCost: 20000,
      tax: 30000,
      discount: 0,
      total: 300000,
      shippingAddress: "New Delhi",
      estimatedDelivery: "2026-08-30T00:00:00.000Z",
      items: [{
        id: "line-1",
        quantity: 2,
        size: "5×7",
        price: 125000,
        product: {
          id: "product-1",
          title: "Blue Study",
          images: [{ url: "/blue-study.jpg" }],
          artist: { user: { firstName: "Asha", lastName: "Rao" } },
        },
      }],
    }])).toMatchObject([{
      id: "line-1",
      title: "Blue Study",
      artist: "Asha Rao",
      price: 2500,
      status: "delivered",
      image: "/blue-study.jpg",
    }]);
  });

  it("prefers per-item fulfillment status when present", () => {
    expect(mapOrdersToItems([{
      id: "order-1",
      status: "PROCESSING",
      createdAt: "2026-08-24T00:00:00.000Z",
      subtotal: 10000,
      shippingCost: 20000,
      tax: 1200,
      discount: 0,
      total: 31200,
      shippingAddress: "New Delhi",
      estimatedDelivery: null,
      items: [{
        id: "line-1",
        quantity: 1,
        size: "5×7",
        price: 10000,
        fulfillmentStatus: "SHIPPED",
        product: { id: "product-1", title: "Blue Study", images: [], artist: { user: { firstName: "Asha", lastName: "Rao" } } },
      }],
    }])).toMatchObject([{ status: "in-transit" }]);
  });
});

describe("product relationship adapters", () => {
  it("uses the artist avatar from the API when mapping a product", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      id: "product-1",
      title: "Blue Study",
      description: null,
      price: 240000,
      originalPrice: null,
      discount: null,
      category: "PAINTINGS",
      badge: null,
      stock: 1,
      artist: {
        id: "artist-1",
        handle: "asha-rao",
        verified: false,
        user: { firstName: "Asha", lastName: "Rao", avatar: "/artists/asha.jpg" },
      },
      images: [{ url: "/blue-study.jpg" }, { url: "/blue-study-detail.jpg" }],
      rating: 4,
      reviewCount: 2,
    });

    await expect(fetchProductById("product-1")).resolves.toMatchObject({
      artistImage: "/artists/asha.jpg",
      images: ["/blue-study.jpg", "/blue-study-detail.jpg"],
    });
  });

  it("keeps not-found responses distinct from retriable API failures", async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new ApiClientError("Not found", 404));
    await expect(fetchProductById("missing-product")).resolves.toBeNull();

    vi.mocked(apiRequest).mockRejectedValueOnce(new ApiClientError("Server unavailable", 503));
    await expect(fetchProductById("product-1")).rejects.toMatchObject({ status: 503 });
  });

  it("requests related products through the product artist filter", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([
      {
        id: "product-1",
        title: "Blue Study",
        description: null,
        price: 240000,
        originalPrice: null,
        discount: null,
        category: "PAINTINGS",
        badge: null,
        stock: 1,
        artist: { id: "artist-1", handle: "asha-rao", verified: false, user: { firstName: "Asha", lastName: "Rao", avatar: null } },
        images: [{ url: "/blue-study.jpg" }],
      },
      {
        id: "product-2",
        title: "Quiet Form",
        description: null,
        price: 180000,
        originalPrice: null,
        discount: null,
        category: "PAINTINGS",
        badge: null,
        stock: 1,
        artist: { id: "artist-1", handle: "asha-rao", verified: false, user: { firstName: "Asha", lastName: "Rao", avatar: null } },
        images: [{ url: "/quiet-form.jpg" }],
      },
    ]);

    await expect(fetchRelatedProducts("product-1", "artist-1")).resolves.toMatchObject([
      { id: "product-2", artistName: "Asha Rao" },
    ]);
    expect(apiRequest).toHaveBeenCalledWith("/api/products?limit=50&artistId=artist-1");
  });
});
