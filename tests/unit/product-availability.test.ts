import { describe, expect, it } from "vitest";
import { getProductBadge, isProductSold } from "@/lib/product-availability";

describe("isProductSold", () => {
  it("marks zero and negative stock as sold", () => {
    expect(isProductSold(0)).toBe(true);
    expect(isProductSold(-1)).toBe(true);
  });

  it("keeps available and unknown stock unsold", () => {
    expect(isProductSold(1)).toBe(false);
    expect(isProductSold(undefined)).toBe(false);
  });
});

describe("getProductBadge", () => {
  const limitedEdition = {
    artworkType: "LIMITED_EDITION" as const,
    editionSize: 25,
    fulfillmentMode: "PHYSICAL" as const,
  };

  it("leaves ordinary listings unbadged rather than displaying arbitrary labels", () => {
    for (const badge of [undefined, "DEMO", "FEATURED", "LIMITED EDITION", "SOLD"]) {
      expect(getProductBadge({ stock: 1, badge })).toBeNull();
    }
    expect(getProductBadge({})).toBeNull();
  });

  it("does not label non-sale museum references as sold or limited edition", () => {
    expect(getProductBadge({ stock: 0, badge: "REFERENCE" })).toBeNull();
    expect(getProductBadge({ stock: 1, badge: "REFERENCE", artworkDetails: limitedEdition })).toBeNull();
  });

  it("shows sold for unavailable marketplace listings before considering edition type", () => {
    expect(getProductBadge({ stock: 0, badge: "DEMO" })).toBe("Sold");
    expect(getProductBadge({ stock: 0, artworkDetails: limitedEdition })).toBe("Sold");
  });

  it("shows limited edition when the listing declares a limited edition and its size", () => {
    expect(getProductBadge({ stock: 3, badge: "DEMO", artworkDetails: limitedEdition })).toBe("Limited edition");
  });

  it("requires edition facts rather than an unsupported scarcity label", () => {
    for (const editionSize of [undefined, null, 0, -1]) {
      expect(getProductBadge({ stock: 1, artworkDetails: { ...limitedEdition, editionSize } })).toBeNull();
    }
    expect(getProductBadge({ stock: 1, artworkDetails: { ...limitedEdition, artworkType: "ORIGINAL" } })).toBeNull();
  });
});
