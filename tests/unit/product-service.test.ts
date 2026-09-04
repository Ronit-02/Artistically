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

const lowRatedCandidate = {
  id: "cm7q1k8l90000abcde1234567",
  reviews: [{ rating: 2 }],
};

const highRatedCandidate = {
  id: "cm7q1k8l90000abcde1234568",
  reviews: [{ rating: 5 }],
};

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
