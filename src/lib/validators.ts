// ─────────────────────────────────────────────────────────────────────────────
// lib/validators.ts
// Zod schemas for validating all incoming request bodies
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

const NormalizedEmailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform((email) => email.toLowerCase());

export const RegisterSchema = z.object({
  email: NormalizedEmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const LoginSchema = z.object({
  email: NormalizedEmailSchema,
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

export const CuidSchema = z.string().cuid("Invalid ID");
export const MediaAssetIdSchema = z.string().trim().min(10).max(100);

const CATEGORIES = [
  "PAINTINGS", "SCULPTURES", "CERAMICS",
  "DIGITAL_ART", "GLASS_ART", "WOODWORK",
  "PHOTOGRAPHY", "TEXTILE",
] as const;

const ArtworkDetailsFieldsSchema = z.object({
  artworkType: z.enum(["ORIGINAL", "LIMITED_EDITION", "MADE_TO_ORDER", "DIGITAL"]),
  medium: z.string().trim().min(1).max(100).optional(),
  materials: z.string().max(300).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  dimensionUnit: z.enum(["cm", "in"]).default("cm"),
  year: z.number().int().min(1000).max(2100).optional(),
  condition: z.string().max(100).optional(),
  framing: z.string().max(100).optional(),
  editionSize: z.number().int().positive().optional(),
  editionNumber: z.number().int().positive().optional(),
  authenticity: z.string().max(500).optional(),
  provenance: z.string().max(1000).optional(),
  fulfillmentMode: z.enum(["PHYSICAL", "DIGITAL"]).default("PHYSICAL"),
});

const ProductImageUrlSchema = z
  .string()
  .url("Invalid image URL")
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Image URL must use HTTP or HTTPS");

export const ArtworkDetailsSchema = ArtworkDetailsFieldsSchema.superRefine((details, context) => {
  if (details.medium === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["medium"],
      message: "Artwork medium is required",
    });
  }

  if (details.fulfillmentMode === "PHYSICAL" && details.width === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["width"],
      message: "Physical artwork must declare a width",
    });
  }

  if (details.fulfillmentMode === "PHYSICAL" && details.height === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["height"],
      message: "Physical artwork must declare a height",
    });
  }

  if (details.artworkType === "DIGITAL" && details.fulfillmentMode !== "DIGITAL") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fulfillmentMode"],
      message: "Digital artwork must use digital fulfillment",
    });
  }

  if (details.artworkType !== "DIGITAL" && details.fulfillmentMode === "DIGITAL") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fulfillmentMode"],
      message: "Physical artwork must use physical fulfillment",
    });
  }

  if (details.artworkType === "LIMITED_EDITION" && details.editionSize === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["editionSize"],
      message: "Limited editions must declare an edition size",
    });
  }

  if (
    details.editionNumber !== undefined &&
    details.editionSize === undefined
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["editionSize"],
      message: "Edition size is required when an edition number is provided",
    });
  }

  if (
    details.editionNumber !== undefined &&
    details.editionSize !== undefined &&
    details.editionNumber > details.editionSize
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["editionNumber"],
      message: "Edition number cannot exceed edition size",
    });
  }

  if (details.artworkType !== "LIMITED_EDITION" && details.editionSize !== undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["editionSize"],
      message: "Only limited editions can declare an edition size",
    });
  }

  if (details.artworkType !== "LIMITED_EDITION" && details.editionNumber !== undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["editionNumber"],
      message: "Only limited editions can declare an edition number",
    });
  }
});

const ProductFieldsSchema = z.object({
  title: z.string().min(3, "Title too short").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  discount: z.number().int().min(0).max(100).optional(),
  category: z.enum(CATEGORIES),
  badge: z.string().max(50).optional(),
  stock: z.number().int().min(0).default(1),
  processingDays: z.number().int().min(1).max(90).optional(),
  images: z
    .array(ProductImageUrlSchema)
    .min(1, "At least one image required")
    .max(10, "A listing can include at most 10 images"),
  artworkDetails: ArtworkDetailsSchema,
});

export const CreateProductSchema = ProductFieldsSchema.superRefine((product, context) => {
  if (product.originalPrice !== undefined && product.originalPrice <= product.price) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["originalPrice"],
      message: "Original price must be greater than the current price",
    });
  }

  if (product.discount !== undefined && product.originalPrice === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discount"],
      message: "A discount requires an original price",
    });
  }

  if (product.artworkDetails?.artworkType === "ORIGINAL" && product.stock > 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["stock"],
      message: "An original artwork can have available stock of zero or one",
    });
  }

  if (
    product.artworkDetails?.artworkType === "LIMITED_EDITION" &&
    product.artworkDetails.editionSize !== undefined &&
    product.stock > product.artworkDetails.editionSize
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["stock"],
      message: "Available stock cannot exceed the edition size",
    });
  }
});

export const UpdateProductSchema = ProductFieldsSchema.extend({
  artworkDetails: ArtworkDetailsFieldsSchema.partial().optional(),
}).partial().superRefine((product, context) => {
  if (
    product.originalPrice !== undefined &&
    product.price !== undefined &&
    product.originalPrice <= product.price
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["originalPrice"],
      message: "Original price must be greater than the current price",
    });
  }
});

export const ProductIdSchema = z.object({
  productId: CuidSchema,
});

export const RouteIdSchema = z.object({ id: CuidSchema });

export const ProductQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    category: z.enum(CATEGORIES).optional(),
    categories: z.array(z.enum(CATEGORIES)).min(1).max(CATEGORIES.length).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    priceRanges: z.array(z.string().regex(/^\d+(?:\.\d+)?-(?:\d+(?:\.\d+)?|\+)$/)).min(1).optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    minRatings: z.array(z.coerce.number().min(1).max(5)).min(1).optional(),
    search: z.string().max(100).optional(),
    sortBy: z
      .enum(["price_asc", "price_desc", "newest", "popular"])
      .default("newest"),
    artistId: z.string().cuid().optional(),
  })
  .superRefine((query, context) => {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxPrice"],
        message: "maxPrice must be greater than or equal to minPrice",
      });
    }
  });

export const CreateMediaUploadSchema = z.object({
  purpose: z.enum(["ARTWORK_IMAGE", "DIGITAL_FILE", "ARTIST_COVER", "VERIFICATION_EVIDENCE"]),
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().regex(/^[\w.+-]+\/[\w.+-]+$/, "Invalid MIME type"),
  sizeBytes: z.number().int().positive(),
}).superRefine((input, context) => {
  const image = input.purpose === "ARTWORK_IMAGE" || input.purpose === "ARTIST_COVER";
  const max = image ? 15 * 1024 * 1024 : input.purpose === "DIGITAL_FILE" ? 250 * 1024 * 1024 : 10 * 1024 * 1024;
  if (input.sizeBytes > max) context.addIssue({ code: "custom", path: ["sizeBytes"], message: `File exceeds the ${Math.round(max / 1024 / 1024)}MB limit` });
  if (image && !input.mimeType.startsWith("image/")) context.addIssue({ code: "custom", path: ["mimeType"], message: "Artwork media must be an image" });
  if (input.purpose === "DIGITAL_FILE" && ["application/x-msdownload", "application/javascript", "text/html"].includes(input.mimeType)) context.addIssue({ code: "custom", path: ["mimeType"], message: "This digital file type is not allowed" });
});

export const CompleteMediaUploadSchema = z.object({
  checksum: z.string().trim().max(200).optional(),
});

export const CreateArtistSubmissionSchema = ProductFieldsSchema.omit({ images: true }).extend({
  imageAssetIds: z.array(MediaAssetIdSchema).min(1, "At least one artwork image is required").max(10),
  digitalAssetId: MediaAssetIdSchema.optional(),
}).superRefine((input, context) => {
  if (input.artworkDetails.artworkType === "DIGITAL" && !input.digitalAssetId) {
    context.addIssue({ code: "custom", path: ["digitalAssetId"], message: "Digital artwork requires a protected digital file" });
  }
  if (input.artworkDetails.artworkType !== "DIGITAL" && input.digitalAssetId) {
    context.addIssue({ code: "custom", path: ["digitalAssetId"], message: "Only digital artwork can include a digital file" });
  }
});

export const AdminSubmissionQuerySchema = z.object({ status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional() });
export const AdminReconciliationQuerySchema = z.object({ status: z.enum(["RECONCILED", "OUT_OF_BALANCE"]).optional() });
export const DecideSubmissionSchema = z.object({ status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]), reviewNote: z.string().trim().max(1000).optional() });

// ─── Review ──────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  text: z.string().min(10, "Review too short").max(1000),
});

export const UpdateReviewSchema = CreateReviewSchema.partial().refine(
  (review) => Object.keys(review).length > 0,
  { message: "At least one review field is required" },
);

// ─── Moderation reports ─────────────────────────────────────────────────────

export const CreateReportSchema = z.object({
  targetType: z.enum(["PRODUCT", "COLLECTION"]),
  targetId: CuidSchema,
  reason: z.enum(["INACCURATE", "COPYRIGHT", "PROHIBITED", "HARASSMENT", "OTHER"]),
  details: z.string().trim().max(1000).optional(),
});

export const AdminReportQuerySchema = z.object({
  status: z.enum(["OPEN", "DISMISSED", "RESOLVED"]).optional(),
});

export const ResolveReportSchema = z.object({
  status: z.enum(["DISMISSED", "RESOLVED"]),
  action: z.enum(["REMOVE_PRODUCT", "UNPUBLISH_COLLECTION"]).optional(),
  resolutionNote: z.string().trim().max(1000).optional(),
}).superRefine((input, context) => {
  if (input.status === "RESOLVED" && !input.action) {
    context.addIssue({ code: "custom", path: ["action"], message: "A resolution action is required" });
  }
  if (input.status === "DISMISSED" && input.action) {
    context.addIssue({ code: "custom", path: ["action"], message: "Dismissed reports cannot apply a removal action" });
  }
});

export const CreateAppealSchema = z.object({
  statement: z.string().trim().min(20, "Appeal statement is too short").max(2000),
});

export const ResolveAppealSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  decisionNote: z.string().trim().max(1000).optional(),
});

export const AdminAppealQuerySchema = z.object({
  status: z.enum(["OPEN", "APPROVED", "REJECTED"]).optional(),
});

// ─── Artist verification ────────────────────────────────────────────────────

export const SubmitArtistVerificationSchema = z.object({
  identityReference: z.string().trim().min(1, "An identity evidence reference is required").max(300),
  backgroundStatement: z.string().trim().min(20, "Background statement is too short").max(1000),
  portfolioReference: z.string().trim().max(300).optional(),
});

export const AdminVerificationQuerySchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "REVOKED"]).optional(),
});

export const DecideArtistVerificationSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "VERIFIED", "REJECTED", "REVOKED"]),
  decisionNote: z.string().trim().min(1, "A decision note is required").max(1000),
});

// ─── Cart ────────────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  productId: CuidSchema,
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

export const UpdateFulfillmentStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "IN_TRANSIT", "DELIVERED"]),
});

export const UpdateShipmentSchema = z.object({
  status: z.enum(["LABEL_CREATED", "IN_TRANSIT", "DELIVERED", "EXCEPTION"]),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  trackingUrl: z.string().url().optional(),
  location: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
});

export const ShipmentProviderEventSchema = z.object({
  eventId: z.string().trim().min(1).max(200),
  sellerOrderId: z.string().cuid(),
  status: z.enum(["LABEL_CREATED", "IN_TRANSIT", "DELIVERED", "EXCEPTION"]),
  occurredAt: z.string().datetime(),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  trackingUrl: z.string().url().optional(),
  location: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
});

export const CreateConnectLinkSchema = z.object({
  returnUrl: z.string().url(),
  refreshUrl: z.string().url(),
});

export const CreatePayoutSchema = z.object({
  amountMinor: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(8).max(100),
});

export const CheckoutQuoteSchema = z.object({
  promoCode: z.string().max(20).optional(),
});

export const CreateCheckoutSessionSchema = z.object({
  shippingAddress: z.string().trim().min(10, "Address too short").max(300),
  promoCode: z.string().max(20).optional(),
  idempotencyKey: z.string().trim().min(8).max(100),
});

export const CreateRefundSchema = z.object({
  amountMinor: z.number().int().positive().optional(),
  reason: z.string().trim().max(500).optional(),
  sellerOrderId: CuidSchema.optional(),
  idempotencyKey: z.string().trim().min(8).max(100),
});

export const PublishDigitalDeliverySchema = z.object({
  assetReference: z.string().trim().min(1).max(1000),
  downloadLimit: z.number().int().min(1).max(20).default(3),
});

export const DownloadDigitalDeliverySchema = z.object({
  acceptLicense: z.literal(true),
});

export const CreateDisputeSchema = z.object({
  type: z.enum(["DAMAGE", "NON_DELIVERY", "AUTHENTICITY", "COPYRIGHT", "DIGITAL_ACCESS", "OTHER"]),
  reason: z.string().trim().min(10).max(2000),
  orderItemId: CuidSchema.optional(),
  sellerOrderId: CuidSchema.optional(),
});

export const DisputeQuerySchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"]).optional(),
});

export const ResolveDisputeSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "REJECTED"]),
  resolutionNote: z.string().trim().max(2000).optional(),
});

export const AdminReviewQuerySchema = z.object({
  status: z.enum(["PUBLISHED", "HIDDEN", "REMOVED"]).optional(),
});

export const ModerateReviewSchema = z.object({
  status: z.enum(["PUBLISHED", "HIDDEN", "REMOVED"]),
  moderationNote: z.string().trim().max(2000).optional(),
});

export const EvidencePolicySchema = z.object({
  providerKey: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(120),
  retentionDays: z.number().int().min(1).max(3650),
  active: z.boolean().default(true),
});

export const CreateCertificateSchema = z.object({
  productId: CuidSchema,
  certificateNumber: z.string().trim().min(3).max(100),
  mediaAssetId: MediaAssetIdSchema.optional(),
  note: z.string().trim().max(1000).optional(),
});

export const AdminCertificateQuerySchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REVOKED"]).optional(),
});

export const UpdateCertificateSchema = z.object({
  status: z.enum(["VERIFIED", "REVOKED"]),
  note: z.string().trim().max(1000).optional(),
});

// ─── Artist ──────────────────────────────────────────────────────────────────

export const CreateArtistSchema = z.object({
  handle: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^@[a-z0-9_]+$/, "Handle must start with @ and contain only lowercase letters, numbers, underscores"),
  bio: z.string().trim().max(500).optional(),
  cover: z
    .string()
    .url("Invalid cover URL")
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    }, "Cover URL must use HTTP or HTTPS")
    .optional(),
});

export const UpdateArtistSchema = CreateArtistSchema.partial().refine(
  (artist) => Object.keys(artist).length > 0,
  { message: "At least one artist profile field is required" },
);

// ─── Artist collections ────────────────────────────────────────────────────

const CollectionFieldsSchema = z.object({
  name: z.string().trim().min(3, "Collection name is too short").max(100),
  description: z.string().trim().max(2000),
  coverImage: z.string().url("Invalid cover image URL").refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Cover image URL must use HTTP or HTTPS"),
  productIds: z.array(CuidSchema).max(50),
});

export const CreateArtistCollectionSchema = CollectionFieldsSchema;

export const UpdateArtistCollectionSchema = CollectionFieldsSchema.partial().refine(
  (collection) => Object.keys(collection).length > 0,
  { message: "At least one collection field is required" },
);

// ─── Helper: parse and return 400 on failure ─────────────────────────────────

export function validate<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown
): z.output<TSchema> {
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
