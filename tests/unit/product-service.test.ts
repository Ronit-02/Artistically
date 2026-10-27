import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  productCount: vi.fn(),
  productFindUnique: vi.fn(),
  productCreate: vi.fn(),
  productUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
      findUnique: mocks.productFindUnique,
      create: mocks.productCreate,
      update: mocks.productUpdate,
    },
  },
}));

import { productService } from "@/lib/services/product.service";
import { ProductQuerySchema, validate } from "@/lib/validators";
import { BROWSE_PRODUCT_WHERE } from "@/lib/product-visibility";

const lowRatedCandidate = {
  id: "cm7q1k8l90000abcde1234567",
  reviews: [{ rating: 2 }],
};

const highRatedCandidate = {
  id: "cm7q1k8l90000abcde1234568",
  reviews: [{ rating: 5 }],
};

describe("sold listing discovery and search ranking", () => {
  beforeEach(() => vi.resetAllMocks());

  it("filters sold listings in the database before pagination and counting", async () => {
    mocks.productFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);
    await productService.list(validate(ProductQuerySchema, { search: "study" }));
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ AND: [BROWSE_PRODUCT_WHERE] }),
    }));
    expect(mocks.productCount).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ AND: [BROWSE_PRODUCT_WHERE] }),
    }));
  });

  it.each([{ search: "study" }, { category: "PAINTINGS" }, { categories: ["PAINTINGS", "CERAMICS"] }])("fills a page with available matches before sold matches for %j", async (filters) => {
    mocks.productCount.mockResolvedValueOnce(7).mockResolvedValueOnce(5);
    mocks.productFindMany.mockResolvedValue([{ id: "available", reviews: [] }]);
    const result = await productService.list(validate(ProductQuerySchema, {
      ...filters, includeSold: true, page: 1, limit: 3, sortBy: "price_asc",
    }));
    expect(result.total).toBe(7);
    expect(mocks.productFindMany).toHaveBeenCalledTimes(1);
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { AND: [expect.objectContaining(filters.search ? { OR: expect.any(Array) } : { category: filters.categories ? { in: filters.categories } : filters.category }), { stock: { gt: 0 } }] },
      skip: 0, take: 3, orderBy: [{ price: "asc" }, { id: "asc" }],
    }));
  });

  it.each([{ search: "study" }, { category: "PAINTINGS" }, { categories: ["PAINTINGS", "CERAMICS"] }])("joins available and sold matches at the page boundary for %j", async (filters) => {
    mocks.productCount.mockResolvedValueOnce(7).mockResolvedValueOnce(4);
    mocks.productFindMany
      .mockResolvedValueOnce([{ id: "available-last", reviews: [] }])
      .mockResolvedValueOnce([{ id: "sold-first", reviews: [] }, { id: "sold-second", reviews: [] }]);
    const result = await productService.list(validate(ProductQuerySchema, {
      ...filters, includeSold: true, page: 2, limit: 3,
    }));
    expect(result.products.map((product) => product.id)).toEqual(["available-last", "sold-first", "sold-second"]);
    expect(result.total).toBe(7);
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ skip: 3, take: 1 }));
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { AND: [expect.any(Object), { stock: { lte: 0 } }] }, skip: 0, take: 2,
    }));
  });

  it.each([{ search: "study" }, { category: "PAINTINGS" }, { categories: ["PAINTINGS", "CERAMICS"] }])("offsets later sold-only pages without repeating matches for %j", async (filters) => {
    mocks.productCount.mockResolvedValueOnce(10).mockResolvedValueOnce(4);
    mocks.productFindMany.mockResolvedValue([{ id: "sold-third", reviews: [] }]);
    await productService.list(validate(ProductQuerySchema, { ...filters, includeSold: true, page: 3, limit: 3 }));
    expect(mocks.productFindMany).toHaveBeenCalledTimes(1);
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { AND: [expect.any(Object), { stock: { lte: 0 } }] }, skip: 2, take: 3,
    }));
  });

  it("keeps rating and price filters when ranking explicit search results", async () => {
    mocks.productFindMany
      .mockResolvedValueOnce([lowRatedCandidate, highRatedCandidate])
      .mockResolvedValueOnce([highRatedCandidate]);
    mocks.productCount.mockResolvedValueOnce(1);
    const result = await productService.list(validate(ProductQuerySchema, {
      search: "study", includeSold: true, minRating: 4, priceRanges: ["1000-+"], limit: 1,
    }));
    expect(result.total).toBe(1);
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({ AND: [{ OR: [{ price: { gte: 100000 } }] }] }),
    }));
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { AND: [expect.objectContaining({ id: { in: [highRatedCandidate.id] } }), { stock: { gt: 0 } }] },
    }));
  });

  it("preserves all inventory records when the route authorizes an inventory read", async () => {
    mocks.productCount.mockResolvedValue(1);
    mocks.productFindMany.mockResolvedValue([{ id: "sold-inventory", reviews: [] }]);
    await productService.list(validate(ProductQuerySchema, { includeSold: true, artistId: "cm7q1k8l90000abcde1234567" }));
    expect(mocks.productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isActive: true, artistId: "cm7q1k8l90000abcde1234567" },
    }));
  });
});

describe("product rating filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters before pagination and reports the eligible total", async () => {
    const query = validate(ProductQuerySchema, {
      page: "1",
      limit: "1",
      minRating: "4",
    });

    mocks.productFindMany
      .mockResolvedValueOnce([lowRatedCandidate, highRatedCandidate])
      .mockResolvedValueOnce([{ ...highRatedCandidate }]);

    const result = await productService.list(query);

    expect(result.total).toBe(1);
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe(highRatedCandidate.id);
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      skip: 0,
      take: 1,
      where: expect.objectContaining({
        id: { in: [highRatedCandidate.id] },
      }),
    }));
    expect(mocks.productCount).not.toHaveBeenCalled();
  });

  it("applies repeated category, price-range, and rating filters before pagination", async () => {
    const query = validate(ProductQuerySchema, {
      page: "1",
      limit: "12",
      categories: ["PAINTINGS", "CERAMICS"],
      priceRanges: ["0-499", "1000-+"],
      minRatings: ["4", "3"],
    });

    mocks.productFindMany
      .mockResolvedValueOnce([{ ...highRatedCandidate }])
      .mockResolvedValueOnce([{ ...highRatedCandidate }]);

    const result = await productService.list(query);

    expect(result.total).toBe(1);
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({
        category: { in: ["PAINTINGS", "CERAMICS"] },
        OR: [{ price: { gte: 0, lte: 49900 } }, { price: { gte: 100000 } }],
      }),
    }));
    expect(mocks.productFindMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: expect.objectContaining({ id: { in: [highRatedCandidate.id] } }),
      skip: 0,
      take: 12,
    }));
  });
});

describe("product update pricing invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productFindUnique.mockResolvedValue({
      id: "cm7q1k8l90000abcde1234567",
      artistId: "cm7q1k8l90000abcde1234568",
      price: 100000,
      originalPrice: null,
      discount: null,
      stock: 1,
      artworkDetails: { artworkType: "ORIGINAL", editionSize: null, fulfillmentMode: "PHYSICAL" },
    });
  });

  it("rejects a discount-only update when the persisted product has no original price", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { discount: 10 },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { discount: ["A discount requires an original price"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects an original-price-only update that does not exceed the persisted price", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { originalPrice: 900 },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { originalPrice: ["Original price must be greater than the current price"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects a stock update that would oversell a persisted original artwork", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { stock: 2 },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { stock: ["An original artwork can have available stock of zero or one"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects a digital artwork update with physical fulfillment", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { artworkDetails: { artworkType: "DIGITAL", fulfillmentMode: "PHYSICAL" } },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { fulfillmentMode: ["Digital artwork must use digital fulfillment"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects a physical artwork update with digital fulfillment", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { artworkDetails: { fulfillmentMode: "DIGITAL" } },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { fulfillmentMode: ["Physical artwork must use physical fulfillment"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects an explicit artwork-detail update without physical dimensions", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { artworkDetails: { medium: "Oil" } },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { width: ["Physical artwork must declare a width"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("rejects edition metadata on a non-limited artwork update", async () => {
    await expect(productService.update(
      "cm7q1k8l90000abcde1234567",
      "cm7q1k8l90000abcde1234568",
      { artworkDetails: { editionSize: 5 } },
    )).rejects.toMatchObject({
      name: "ValidationError",
      fields: { editionSize: ["Only limited editions can declare an edition size"] },
    });
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });
});

describe("product create invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechecks fulfillment invariants inside the domain service", async () => {
    await expect(productService.create("cm7q1k8l90000abcde1234567", {
      title: "Digital Study",
      price: 1000,
      category: "DIGITAL_ART",
      stock: 1,
      images: ["https://example.com/digital-study.jpg"],
      artworkDetails: {
        artworkType: "DIGITAL",
        medium: "Digital illustration",
        width: 40,
        height: 60,
        dimensionUnit: "cm",
        fulfillmentMode: "PHYSICAL",
      },
    })).rejects.toMatchObject({
      name: "ValidationError",
      fields: { fulfillmentMode: ["Digital artwork must use digital fulfillment"] },
    });
    expect(mocks.productCreate).not.toHaveBeenCalled();
  });
});
