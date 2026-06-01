// ─────────────────────────────────────────────────────────────────────────────
// lib/validators.ts
// Zod schemas for validating all incoming request bodies
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── User ────────────────────────────────────────────────────────────────────

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number").optional(),
  address: z.string().max(300).optional(),
  avatar: z.string().url("Invalid URL").optional(),
});

// ─── Product ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "PAINTINGS", "SCULPTURES", "CERAMICS",
  "DIGITAL_ART", "GLASS_ART", "WOODWORK",
  "PHOTOGRAPHY", "TEXTILE",
] as const;

export const CreateProductSchema = z.object({
  title: z.string().min(3, "Title too short").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  discount: z.number().int().min(0).max(100).optional(),
  category: z.enum(CATEGORIES),
  badge: z.string().max(50).optional(),
  stock: z.number().int().min(0).default(1),
  images: z.array(z.string().url()).min(1, "At least one image required"),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.enum(CATEGORIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "popular"])
    .default("newest"),
  artistId: z.string().cuid().optional(),
});

// ─── Review ──────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  text: z.string().min(10, "Review too short").max(1000),
});

export const UpdateReviewSchema = CreateReviewSchema.partial();

// ─── Cart ────────────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.number().int().min(1).max(10).default(1),
  size: z.string().max(20).default("5×7"),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

// ─── Order ───────────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  shippingAddress: z.string().min(10, "Address too short").max(300),
  promoCode: z.string().max(20).optional(),
});

// ─── Artist ──────────────────────────────────────────────────────────────────

export const CreateArtistSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^@[a-z0-9_]+$/, "Handle must start with @ and contain only lowercase letters, numbers, underscores"),
  bio: z.string().max(500).optional(),
  cover: z.string().url().optional(),
});

export const UpdateArtistSchema = CreateArtistSchema.partial();

// ─── Helper: parse and return 400 on failure ─────────────────────────────────

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }
  return result.data;
}

export class ValidationError extends Error {
  public readonly fields: Record<string, string[] | undefined>;
  constructor(fields: Record<string, string[] | undefined>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.fields = fields;
  }
}
