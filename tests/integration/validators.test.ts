import { describe, expect, it } from "vitest";
import {
  AddToCartSchema,
  ArtworkDetailsSchema,
  CreateArtistSchema,
  CreateArtistCollectionSchema,
  CreateProductSchema,
  LoginSchema,
  ProductIdSchema,
  ProductQuerySchema,
  RegisterSchema,
  RouteIdSchema,
  UpdateCartItemSchema,
  UpdateArtistSchema,
  UpdateReviewSchema,
  validate,
} from "@/lib/validators";

describe("authentication boundaries", () => {
  it("normalizes registration and login email addresses", () => {
    expect(validate(RegisterSchema, {
      email: "  Collector@Example.COM ",
      password: "Password1",
      firstName: "Asha",
      lastName: "Rao",
    }).email).toBe("collector@example.com");

    expect(validate(LoginSchema, {
      email: "  Artist@Example.COM ",
      password: "Password1",
    }).email).toBe("artist@example.com");
  });
});

describe("product query boundary", () => {
  it("rejects malformed product identifiers before persistence lookups", () => {
    expect(() => validate(ProductIdSchema, { productId: "not-a-cuid" })).toThrow(
      "Validation failed",
    );
    expect(() => validate(ProductIdSchema, null)).toThrow("Validation failed");
  });

  it("rejects malformed protected route identifiers", () => {
    expect(() => validate(RouteIdSchema, { id: "not-a-cuid" })).toThrow(
      "Validation failed",
    );
  });

  it("coerces query strings and applies pagination defaults", () => {
    const query = validate(ProductQuerySchema, {
      limit: "24",
      minPrice: "500",
      sortBy: "price_asc",
    });

    expect(query).toEqual({
      page: 1,
      limit: 24,
      minPrice: 500,
      sortBy: "price_asc",
    });
  });

  it("rejects unsupported categories", () => {
    expect(() =>
      validate(ProductQuerySchema, { category: "PRINTS" })
    ).toThrow("Validation failed");
  });

  it("rejects contradictory price ranges", () => {
    expect(() => validate(ProductQuerySchema, {
      minPrice: "2000",
      maxPrice: "500",
    })).toThrow("Validation failed");
  });

  it("rejects misleading product comparison pricing", () => {
    const base = {
      title: "Quiet Study",
      price: 1000,
      category: "PAINTINGS" as const,
      images: ["https://example.com/study.jpg"],
      artworkDetails: {
        artworkType: "ORIGINAL" as const,
        fulfillmentMode: "PHYSICAL" as const,
      },
    };

    expect(() => validate(CreateProductSchema, { ...base, originalPrice: 900 })).toThrow("Validation failed");
    expect(() => validate(CreateProductSchema, { ...base, discount: 10 })).toThrow("Validation failed");
    const completePhysicalDetails = {
      artworkType: "ORIGINAL" as const,
      medium: "Acrylic",
      width: 40,
      height: 60,
      fulfillmentMode: "PHYSICAL" as const,
    };

    expect(validate(CreateProductSchema, {
      ...base,
      artworkDetails: completePhysicalDetails,
      originalPrice: 1200,
      discount: 10,
    })).toMatchObject({
      price: 1000,
      originalPrice: 1200,
      discount: 10,
    });

    expect(() => validate(CreateProductSchema, {
      ...base,
      images: ["ftp://example.com/study.jpg"],
    })).toThrow("Validation failed");

    expect(() => validate(CreateProductSchema, {
      ...base,
      images: Array.from({ length: 11 }, (_, index) => `https://example.com/study-${index}.jpg`),
    })).toThrow("Validation failed");

    expect(() => validate(CreateProductSchema, {
      ...base,
      artworkDetails: undefined,
    })).toThrow("Validation failed");

    expect(() => validate(CreateProductSchema, {
      ...base,
      stock: 2,
      artworkDetails: {
        ...completePhysicalDetails,
      },
    })).toThrow("Validation failed");

    expect(() => validate(CreateProductSchema, {
      ...base,
      stock: 11,
      artworkDetails: {
        artworkType: "LIMITED_EDITION",
        medium: "Acrylic",
        width: 40,
        height: 60,
        editionSize: 10,
        fulfillmentMode: "PHYSICAL",
      },
    })).toThrow("Validation failed");
  });

  it("validates category-aware artwork details", () => {
    expect(validate(ArtworkDetailsSchema, {
      artworkType: "LIMITED_EDITION",
      medium: "Acrylic",
      width: 40,
      height: 60,
      year: 2026,
      editionSize: 10,
      editionNumber: 2,
      fulfillmentMode: "PHYSICAL",
    })).toMatchObject({
      artworkType: "LIMITED_EDITION",
      dimensionUnit: "cm",
      fulfillmentMode: "PHYSICAL",
    });

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "ORIGINAL",
      fulfillmentMode: "PHYSICAL",
    })).toThrow("Validation failed");

    expect(validate(ArtworkDetailsSchema, {
      artworkType: "DIGITAL",
      medium: "Digital painting",
      fulfillmentMode: "DIGITAL",
    })).toMatchObject({ artworkType: "DIGITAL" });

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "LIMITED_EDITION",
      editionSize: 5,
      editionNumber: 6,
      fulfillmentMode: "PHYSICAL",
    })).toThrow("Validation failed");

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "LIMITED_EDITION",
      fulfillmentMode: "PHYSICAL",
    })).toThrow("Validation failed");

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "DIGITAL",
      fulfillmentMode: "PHYSICAL",
    })).toThrow("Validation failed");

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "ORIGINAL",
      fulfillmentMode: "DIGITAL",
    })).toThrow("Validation failed");

    expect(() => validate(ArtworkDetailsSchema, {
      artworkType: "ORIGINAL",
      medium: "Oil",
      width: 40,
      height: 60,
      editionSize: 5,
      fulfillmentMode: "PHYSICAL",
    })).toThrow("Validation failed");

    expect(validate(ArtworkDetailsSchema, {
      artworkType: "DIGITAL",
      medium: "Digital illustration",
      fulfillmentMode: "DIGITAL",
    })).toMatchObject({
      artworkType: "DIGITAL",
      fulfillmentMode: "DIGITAL",
    });
  });
});

describe("cart mutation boundaries", () => {
  it("applies safe cart defaults", () => {
    expect(validate(AddToCartSchema, { productId: "cm7q1k8l90000abcde1234567" })).toEqual({
      productId: "cm7q1k8l90000abcde1234567",
      quantity: 1,
      size: "5×7",
    });
  });

  it("rejects quantities outside the cart limit", () => {
    expect(() => validate(UpdateCartItemSchema, { quantity: 0 })).toThrow("Validation failed");
    expect(() => validate(UpdateCartItemSchema, { quantity: 11 })).toThrow("Validation failed");
  });
});

describe("review mutation boundaries", () => {
  it("rejects an empty review update", () => {
    expect(() => validate(UpdateReviewSchema, {})).toThrow("Validation failed");
  });

  it("accepts a partial review update with an editable field", () => {
    expect(validate(UpdateReviewSchema, { rating: 5 })).toEqual({ rating: 5 });
  });
});

describe("artist profile boundaries", () => {
  it("accepts the editable artist profile fields", () => {
    expect(validate(UpdateArtistSchema, {
      handle: "@asha_rao",
      bio: "Painter working with layered color.",
    })).toEqual({
      handle: "@asha_rao",
      bio: "Painter working with layered color.",
    });
  });

  it("rejects handles that cannot be published as artist identity", () => {
    expect(() => validate(UpdateArtistSchema, { handle: "Asha Rao" })).toThrow("Validation failed");
  });

  it("validates artist collection fields and owned artwork identifiers", () => {
    expect(validate(CreateArtistCollectionSchema, {
      name: "  Quiet Materials  ",
      description: "Texture-led works.",
      coverImage: "https://example.com/collection.jpg",
      productIds: ["cm7q1k8l90000abcde1234567"],
    })).toMatchObject({ name: "Quiet Materials", productIds: ["cm7q1k8l90000abcde1234567"] });
    expect(() => validate(CreateArtistCollectionSchema, {
      name: "No",
      description: "",
      coverImage: "ftp://example.com/collection.jpg",
      productIds: [],
    })).toThrow("Validation failed");
  });

  it("normalizes artist profile text at the API boundary", () => {
    expect(validate(CreateArtistSchema, {
      handle: "  @asha_rao  ",
      bio: "  Painter working with layered color.  ",
    })).toEqual({
      handle: "@asha_rao",
      bio: "Painter working with layered color.",
    });
  });

  it("rejects unsafe cover URL protocols and empty updates", () => {
    expect(() => validate(CreateArtistSchema, {
      handle: "@asha_rao",
      cover: "ftp://example.com/cover.jpg",
    })).toThrow("Validation failed");
    expect(() => validate(UpdateArtistSchema, {})).toThrow("Validation failed");
  });
});
