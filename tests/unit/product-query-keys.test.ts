import { describe, expect, it } from "vitest";
import { productKeys } from "@/hooks/useProducts";
import { cartKeys } from "@/hooks/useCart";
import { wishlistKeys } from "@/hooks/useWishlist";
import { orderKeys } from "@/hooks/useOrders";
import { artistKeys } from "@/hooks/useArtists";
import { collectionKeys } from "@/hooks/useCollections";

describe("product query keys", () => {
  it("separates artist-filtered catalog reads from the public catalog cache", () => {
    expect(productKeys.list()).toEqual(["products", "list", {}]);
    expect(productKeys.list({ artistId: "cmabcdefghijklmnopqrstuvwx" })).toEqual([
      "products",
      "list",
      { artistId: "cmabcdefghijklmnopqrstuvwx" },
    ]);
  });

  it("keeps search and catalog controls isolated in the cache key", () => {
    expect(productKeys.list({ search: "ceramic", sortBy: "price_asc" })).toEqual([
      "products",
      "list",
      { search: "ceramic", sortBy: "price_asc" },
    ]);
    expect(productKeys.list({ search: "ceramic" })).not.toEqual(
      productKeys.list({ search: "painting" })
    );
  });

  it("keeps server filter combinations isolated", () => {
    expect(productKeys.list({ category: "PAINTINGS", minRating: 4 })).not.toEqual(
      productKeys.list({ category: "PAINTINGS", minRating: 3 })
    );
  });

  it("scopes related-artwork caches to the artist relationship", () => {
    expect(productKeys.related("product-1", "artist-1")).not.toEqual(
      productKeys.related("product-1", "artist-2"),
    );
  });
});

describe("collection query keys", () => {
  it("separates collection lists and details by persisted collection ID", () => {
    expect(collectionKeys.all).toEqual(["collections"]);
    expect(collectionKeys.detail("collection-a")).not.toEqual(collectionKeys.detail("collection-b"));
  });
});

describe("identity-sensitive query keys", () => {
  it("keeps cart and wishlist caches separate for each user", () => {
    expect(cartKeys.forUser("user-a")).not.toEqual(cartKeys.forUser("user-b"));
    expect(wishlistKeys.forUser("user-a")).not.toEqual(wishlistKeys.forUser("user-b"));
    expect(cartKeys.forUser("user-a")).toEqual(["cart", "user-a"]);
    expect(wishlistKeys.forUser("user-a")).toEqual(["wishlist", "user-a"]);
    expect(artistKeys.follow("artist-1", "user-a")).not.toEqual(
      artistKeys.follow("artist-1", "user-b"),
    );
  });

  it("keeps order lists and details scoped to the authenticated user", () => {
    expect(orderKeys.forUser("user-a")).not.toEqual(orderKeys.forUser("user-b"));
    expect(orderKeys.detail("user-a", "order-1")).not.toEqual(
      orderKeys.detail("user-b", "order-1"),
    );
    expect(orderKeys.detail("user-a", "order-1")).toEqual([
      "orders",
      "user-a",
      "order-1",
    ]);
  });
});
