import { describe, expect, it } from "vitest";
import { buildSearchHref, parseSearchUrl } from "@/lib/search-url";

describe("search URLs", () => {
  it("encodes a trimmed query for shareable search results", () => {
    expect(buildSearchHref("  blue ceramic  ")).toBe("/search?q=blue+ceramic");
  });

  it("returns the base search route for an empty query", () => {
    expect(buildSearchHref("   ")).toBe("/search");
  });

  it("serializes filters, sort, and page without changing the query contract", () => {
    expect(buildSearchHref("blue ceramic", {
      types: ["Ceramics", "Digital Art"],
      prices: ["₹500 - ₹1,000"],
      ratings: [4],
      sort: "price_desc",
      page: 3,
    })).toBe("/search?q=blue+ceramic&type=Ceramics&type=Digital+Art&price=%E2%82%B9500+-+%E2%82%B91%2C000&rating=4&sort=price_desc&page=3");
  });

  it("parses repeated filter values and rejects invalid sort/page values", () => {
    const parsed = parseSearchUrl(new URLSearchParams(
      "q=%20blue%20&type=Ceramics&type=Digital+Art&price=%E2%82%B9500&rating=4&rating=nope&sort=price_desc&page=2",
    ));

    expect(parsed).toEqual({
      query: "blue",
      types: ["Ceramics", "Digital Art"],
      prices: ["₹500"],
      ratings: [4],
      sort: "price_desc",
      page: 2,
    });
    expect(parseSearchUrl(new URLSearchParams("sort=unknown&page=0"))).toMatchObject({
      query: "",
      page: 1,
    });
  });
});
