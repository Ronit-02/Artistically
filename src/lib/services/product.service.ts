// ─────────────────────────────────────────────────────────────────────────────
// lib/services/product.service.ts
// Business logic for products — keeps route handlers thin
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { Prisma, ProductCategory } from "@prisma/client";
import type { z } from "zod";
import type {
  CreateProductSchema,
  ProductQuerySchema,
  UpdateProductSchema,
} from "@/lib/validators";
import { ValidationError } from "@/lib/validators";
import { toMinorUnits } from "@/lib/money";

type ProductQuery = z.infer<typeof ProductQuerySchema>;
type CreateProductInput = z.infer<typeof CreateProductSchema>;
type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ─── Select shape returned to clients ────────────────────────────────────────

const productSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  originalPrice: true,
  discount: true,
  category: true,
  badge: true,
  stock: true,
  processingDays: true,
  createdAt: true,
  artist: {
    select: {
      id: true,
      handle: true,
      verified: true,
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
  },
  images: {
    select: { url: true, isPrimary: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  reviews: {
    select: { rating: true },
  },
  artworkDetails: true,
  certificate: { select: { certificateNumber: true, status: true, issuedAt: true, verifiedAt: true } },
} satisfies Prisma.ProductSelect;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withRating<T extends { reviews: { rating: number }[]; certificate?: { status: string } | null }>(product: T) {
  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  return {
    ...product,
    ...( "certificate" in product && product.certificate && product.certificate.status !== "VERIFIED" ? { certificate: null } : {}),
    rating: Math.round(avg * 10) / 10,
    reviewCount: product.reviews.length,
  };
}

function assertInventoryInvariant(
  artworkType: string | undefined,
  stock: number,
  editionSize: number | undefined,
) {
  if (artworkType === "ORIGINAL" && stock > 1) {
    throw new ValidationError({
      stock: ["An original artwork can have available stock of zero or one"],
    });
  }

  if (artworkType === "LIMITED_EDITION" && editionSize === undefined) {
    throw new ValidationError({
      editionSize: ["Limited editions must declare an edition size"],
    });
  }

  if (artworkType === "LIMITED_EDITION" && editionSize !== undefined && stock > editionSize) {
    throw new ValidationError({
      stock: ["Available stock cannot exceed the edition size"],
    });
  }
}

function assertFulfillmentInvariant(
  artworkType: string | undefined,
  fulfillmentMode: string | undefined,
) {
  if (artworkType === "DIGITAL" && fulfillmentMode === "PHYSICAL") {
    throw new ValidationError({
      fulfillmentMode: ["Digital artwork must use digital fulfillment"],
    });
  }

  if (artworkType !== undefined && artworkType !== "DIGITAL" && fulfillmentMode === "DIGITAL") {
    throw new ValidationError({
      fulfillmentMode: ["Physical artwork must use physical fulfillment"],
    });
  }
}

function assertEditionInvariant(
  artworkType: string | undefined,
  editionSize: number | undefined,
  editionNumber: number | undefined,
) {
  if (artworkType === "LIMITED_EDITION" && editionSize === undefined) {
    throw new ValidationError({
      editionSize: ["Limited editions must declare an edition size"],
    });
  }

  if (artworkType !== undefined && artworkType !== "LIMITED_EDITION" && editionSize !== undefined) {
    throw new ValidationError({
      editionSize: ["Only limited editions can declare an edition size"],
    });
  }

  if (artworkType !== undefined && artworkType !== "LIMITED_EDITION" && editionNumber !== undefined) {
    throw new ValidationError({
      editionNumber: ["Only limited editions can declare an edition number"],
    });
  }

  if (editionNumber !== undefined && editionSize === undefined) {
    throw new ValidationError({
      editionSize: ["Edition size is required when an edition number is provided"],
    });
  }

  if (editionNumber !== undefined && editionSize !== undefined && editionNumber > editionSize) {
    throw new ValidationError({
      editionNumber: ["Edition number cannot exceed edition size"],
    });
  }
}

function assertListingCompleteness(
  fulfillmentMode: string | undefined,
  medium: string | undefined,
  width: number | undefined,
  height: number | undefined,
) {
  if (!medium?.trim()) {
    throw new ValidationError({
      medium: ["Artwork medium is required"],
    });
  }

  if (fulfillmentMode === "PHYSICAL" && width === undefined) {
    throw new ValidationError({
      width: ["Physical artwork must declare a width"],
    });
  }

  if (fulfillmentMode === "PHYSICAL" && height === undefined) {
    throw new ValidationError({
      height: ["Physical artwork must declare a height"],
    });
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const productService = {
  async list(query: ProductQuery) {
    const { page, limit, category, categories, minPrice, maxPrice, priceRanges, minRating, minRatings, search, sortBy, artistId } = query;
    const skip = (page - 1) * limit;

    const categoryFilter = categories?.length
      ? { category: { in: categories as ProductCategory[] } }
      : category
        ? { category: category as ProductCategory }
        : {};
    const parsedPriceRanges = priceRanges?.map((range) => {
      const [minimum, maximum] = range.split("-");
      return { gte: toMinorUnits(Number(minimum)), ...(maximum !== "+" ? { lte: toMinorUnits(Number(maximum)) } : {}) };
    });
    const priceFilter = parsedPriceRanges?.length
      ? { OR: parsedPriceRanges.map((range) => ({ price: range })) }
      : minPrice !== undefined || maxPrice !== undefined
        ? { price: { gte: minPrice === undefined ? undefined : toMinorUnits(minPrice), lte: maxPrice === undefined ? undefined : toMinorUnits(maxPrice) } }
        : {};

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...categoryFilter,
      ...(artistId && { artistId }),
      ...priceFilter,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            artist: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === "price_asc"  ? { price: "asc" }  :
      sortBy === "price_desc" ? { price: "desc" } :
      sortBy === "popular"    ? { reviews: { _count: "desc" } } :
                                { createdAt: "desc" };

    let paginatedWhere = where;
    let totalPromise: Promise<number>;

    const effectiveMinRating = minRatings?.length ? Math.min(...minRatings) : minRating;
    if (effectiveMinRating !== undefined) {
      // Prisma cannot filter a relation aggregate in this query shape. Resolve
      // eligible IDs first, then apply the normal ordering and pagination to
      // the reduced product set so totals and pages stay truthful.
      const candidates = await prisma.product.findMany({
        where,
        select: { id: true, reviews: { select: { rating: true } } },
      });
      const eligibleIds = candidates
        .filter((product) => withRating(product).rating >= effectiveMinRating)
        .map((product) => product.id);

      if (eligibleIds.length === 0) return { products: [], total: 0 };

      paginatedWhere = { ...where, id: { in: eligibleIds } };
      totalPromise = Promise.resolve(eligibleIds.length);
    } else {
      totalPromise = prisma.product.count({ where });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where: paginatedWhere, orderBy, skip, take: limit, select: productSelect }),
      totalPromise,
    ]);

    return { products: products.map(withRating), total };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      select: {
        ...productSelect,
        reviews: {
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!product) return null;
    return withRating(product);
  },

  async create(artistId: string, input: CreateProductInput) {
    const { images, artworkDetails, price, originalPrice, ...data } = input;
    assertListingCompleteness(
      artworkDetails.fulfillmentMode,
      artworkDetails.medium,
      artworkDetails.width,
      artworkDetails.height,
    );
    assertInventoryInvariant(artworkDetails.artworkType, data.stock, artworkDetails.editionSize);
    assertFulfillmentInvariant(artworkDetails.artworkType, artworkDetails.fulfillmentMode);
    assertEditionInvariant(
      artworkDetails.artworkType,
      artworkDetails.editionSize,
      artworkDetails.editionNumber,
    );
    return prisma.product.create({
      data: {
        ...data,
        price: toMinorUnits(price),
        ...(originalPrice !== undefined ? { originalPrice: toMinorUnits(originalPrice) } : {}),
        processingDays: data.processingDays ?? 7,
        artistId,
        ...(artworkDetails ? { artworkDetails: { create: artworkDetails } } : {}),
        images: {
          create: images.map((url, i) => ({
            url,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
      },
      select: productSelect,
    });
  },

  async update(id: string, artistId: string, input: UpdateProductInput) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: { artworkDetails: true },
    });
    if (!product || product.artistId !== artistId) return null;

    const nextPrice = input.price !== undefined ? toMinorUnits(input.price) : product.price;
    const nextOriginalPrice = input.originalPrice !== undefined ? toMinorUnits(input.originalPrice) : product.originalPrice ?? undefined;
    const nextDiscount = input.discount ?? product.discount ?? undefined;
    const nextStock = input.stock ?? product.stock;
    const nextArtworkType = input.artworkDetails?.artworkType ?? product.artworkDetails?.artworkType;
    const nextEditionSize = input.artworkDetails?.editionSize ?? product.artworkDetails?.editionSize ?? undefined;
    const nextFulfillmentMode = input.artworkDetails?.fulfillmentMode ?? product.artworkDetails?.fulfillmentMode;
    const nextMedium = input.artworkDetails?.medium ?? product.artworkDetails?.medium ?? undefined;
    const nextWidth = input.artworkDetails?.width ?? product.artworkDetails?.width ?? undefined;
    const nextHeight = input.artworkDetails?.height ?? product.artworkDetails?.height ?? undefined;

    if (nextOriginalPrice !== undefined && nextOriginalPrice <= nextPrice) {
      throw new ValidationError({
        originalPrice: ["Original price must be greater than the current price"],
      });
    }

    if (nextDiscount !== undefined && nextOriginalPrice === undefined) {
      throw new ValidationError({
        discount: ["A discount requires an original price"],
      });
    }

    assertInventoryInvariant(nextArtworkType, nextStock, nextEditionSize);
    assertFulfillmentInvariant(nextArtworkType, nextFulfillmentMode);
    const nextEditionNumber = input.artworkDetails?.editionNumber ?? product.artworkDetails?.editionNumber ?? undefined;
    assertEditionInvariant(nextArtworkType, nextEditionSize, nextEditionNumber);
    if (input.artworkDetails !== undefined) {
      assertListingCompleteness(nextFulfillmentMode, nextMedium, nextWidth, nextHeight);
    }

    const { images, artworkDetails, price, originalPrice, ...data } = input;
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(price !== undefined ? { price: toMinorUnits(price) } : {}),
        ...(originalPrice !== undefined ? { originalPrice: toMinorUnits(originalPrice) } : {}),
        ...(artworkDetails ? {
          artworkDetails: {
            upsert: {
              create: artworkDetails,
              update: artworkDetails,
            },
          },
        } : {}),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url, i) => ({
              url,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          },
        }),
      },
      select: productSelect,
    });
  },

  async delete(id: string, artistId: string): Promise<boolean> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.artistId !== artistId) return false;
    // Soft delete
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return true;
  },
};
