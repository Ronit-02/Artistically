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
} satisfies Prisma.ProductSelect;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withRating<T extends { reviews: { rating: number }[] }>(product: T) {
  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  return {
    ...product,
    rating: Math.round(avg * 10) / 10,
    reviewCount: product.reviews.length,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const productService = {
  async list(query: ProductQuery) {
    const { page, limit, category, minPrice, maxPrice, minRating, search, sortBy, artistId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && { category: category as ProductCategory }),
      ...(artistId && { artistId }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: { gte: minPrice, lte: maxPrice } }
        : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === "price_asc"  ? { price: "asc" }  :
      sortBy === "price_desc" ? { price: "desc" } :
      sortBy === "popular"    ? { reviews: { _count: "desc" } } :
                                { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: limit, select: productSelect }),
      prisma.product.count({ where }),
    ]);

    // Filter by rating after fetch (Prisma doesn't aggregate in where easily)
    const withRatings = products.map(withRating);
    const filtered = minRating
      ? withRatings.filter((p) => p.rating >= minRating)
      : withRatings;

    return { products: filtered, total };
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
    const { images, ...data } = input;
    return prisma.product.create({
      data: {
        ...data,
        artistId,
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
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.artistId !== artistId) return null;

    const { images, ...data } = input;
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
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
