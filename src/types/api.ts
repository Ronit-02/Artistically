export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  fields?: Record<string, string[]>;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ProductDto = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  category: string;
  badge: string | null;
  stock: number;
  processingDays?: number | null;
  artworkDetails?: ArtworkDetailsDto | null;
  artist: {
    id: string;
    handle: string;
    verified: boolean;
    user: { firstName: string; lastName: string; avatar: string | null };
  };
  images: Array<{ url: string; isPrimary?: boolean; sortOrder?: number }>;
  rating?: number;
  reviewCount?: number;
  certificate?: { certificateNumber: string; status: "VERIFIED"; issuedAt: string; verifiedAt: string | null } | null;
};

export type ArtworkDetailsDto = {
  id: string;
  productId: string;
  artworkType: "ORIGINAL" | "LIMITED_EDITION" | "MADE_TO_ORDER" | "DIGITAL";
  medium: string | null;
  materials: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  dimensionUnit: string;
  year: number | null;
  condition: string | null;
  framing: string | null;
  editionSize: number | null;
  editionNumber: number | null;
  authenticity: string | null;
  provenance: string | null;
  fulfillmentMode: "PHYSICAL" | "DIGITAL";
};

export type ArtistDto = {
  id: string;
  handle: string;
  bio: string | null;
  cover: string | null;
  verified?: boolean;
  verificationStatus?: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "REVOKED";
  user: { firstName: string; lastName: string; avatar: string | null };
  _count: { products: number; followers: number };
  products?: ProductDto[];
};

export type ArtistVerificationDto = {
  id: string;
  artistId: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "REVOKED";
  submittedAt: string | null;
  reviewedAt: string | null;
  decisionNote: string | null;
  evidence: Array<{ type: "IDENTITY" | "BACKGROUND" | "PORTFOLIO"; note: string | null; createdAt: string }>;
};

export type AdminVerificationDto = {
  id: string;
  artistId: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "REVOKED";
  submittedAt: string | null;
  reviewedAt: string | null;
  decisionNote: string | null;
  artist: { id: string; handle: string; verified: boolean; user: { id: string; firstName: string; lastName: string; email: string } };
  reviewer: { id: string; firstName: string; lastName: string } | null;
  evidence: Array<{ id: string; type: "IDENTITY" | "BACKGROUND" | "PORTFOLIO"; reference: string; note: string | null; createdAt: string }>;
};

export type ArtistFollowDto = {
  following: boolean;
};

export type AuthUserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  role: "USER" | "ARTIST" | "ADMIN";
  artist?: { id: string; handle: string; verified: boolean } | null;
};

export type CartItemDto = {
  id: string;
  quantity: number;
  size: string;
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    category: string;
    badge: string | null;
    stock: number;
    images: Array<{ url: string }>;
    artist: { user: { firstName: string; lastName: string } };
  };
};

export type WishlistItemDto = {
  id: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    category: string;
    badge: string | null;
    images: Array<{ url: string }>;
    artist: { user: { firstName: string; lastName: string } };
  };
};

export type StoryDto = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image: string;
  category: string | null;
  date: string;
};

export type CollectionDto = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  artworkCount: number;
  ownerArtist: {
    id: string;
    handle: string;
    verified: boolean;
    name: string;
  } | null;
};

export type CollectionDetailDto = CollectionDto & {
  products: ProductDto[];
};

export type ArtistCollectionDto = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  published: boolean;
  artworkCount: number;
  products: Array<{ id: string; title: string; image: string | null; stock: number; isActive: boolean }>;
};

export type ReviewDto = {
  id: string;
  rating: number;
  text: string;
  verified?: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string | null };
};

export type ReportDto = {
  id: string;
  reason: "INACCURATE" | "COPYRIGHT" | "PROHIBITED" | "HARASSMENT" | "OTHER";
  details: string | null;
  status: "OPEN" | "DISMISSED" | "RESOLVED";
  productId: string | null;
  collectionId: string | null;
  createdAt: string;
};


export type OrderDto = {
  id: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string | null;
  items: Array<{
    id: string;
    quantity: number;
    size: string;
    price: number;
    fulfillmentStatus?: "PENDING" | "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    digitalDelivery?: { id: string; status: string; downloadLimit: number; downloadCount: number; expiresAt: string | null; availableAt: string | null; licenseAcceptedAt: string | null } | null;
    product: {
      id: string;
      title: string;
      images: Array<{ url: string }>;
      artist: { user: { firstName: string; lastName: string } };
    };
  }>;
  deliveryRecords?: Array<{ id: string; type: string; occurredAt: string; note: string | null; orderItemId: string | null; sellerOrderId: string | null }>;
  disputes?: Array<{ id: string; type: string; status: string; reason: string; resolutionNote: string | null; createdAt: string; resolvedAt: string | null }>;
};

export type SellerOrderDto = {
  id: string;
  status: string;
  createdAt: string;
  shippingAddress: string;
  processingDueAt?: string | null;
  lateAt?: string | null;
  items: Array<{
    id: string;
    quantity: number;
    size: string;
    price: number;
    fulfillmentStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    product: { id: string; title: string; images: Array<{ url: string }>; artworkDetails?: { fulfillmentMode: "PHYSICAL" | "DIGITAL" } | null };
  }>;
};

export type ArtistSettlementDto = {
  sellerOrders: Array<{
    id: string;
    orderId: string;
    status: string;
    createdAt: string;
    grossArtworkAmountMinor: number;
    shippingAmountMinor: number;
    platformFeeAmountMinor: number;
    netAllocatedAmountMinor: number;
    currency: string;
  }>;
  payouts: Array<{
    id: string;
    status: string;
    amountMinor: number;
    currency: string;
    availableAt: string | null;
    paidAt: string | null;
  }>;
  settlements: Array<{
    id: string;
    sellerOrderId: string;
    currency: string;
    grossAmountMinor: number;
    shippingAmountMinor: number;
    platformFeeAmountMinor: number;
    refundAmountMinor: number;
    netAmountMinor: number;
    transferredAmountMinor: number;
    outstandingAmountMinor: number;
    status: string;
    reconciledAt: string | null;
    transfer: { id: string; stripeTransferId: string | null; status: string; amountMinor: number } | null;
  }>;
  statement: {
    currency: string;
    grossAmountMinor: number;
    shippingAmountMinor: number;
    platformFeeAmountMinor: number;
    refundAmountMinor: number;
    netAmountMinor: number;
    transferredAmountMinor: number;
    outstandingAmountMinor: number;
    status: string;
  };
};

export type SellerReviewDto = {
  id: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string };
  product: { id: string; title: string };
};

export type AdminReportDto = {
  id: string;
  reason: "INACCURATE" | "COPYRIGHT" | "PROHIBITED" | "HARASSMENT" | "OTHER";
  details: string | null;
  status: "OPEN" | "DISMISSED" | "RESOLVED";
  resolutionNote: string | null;
  createdAt: string;
  reporter: { id: string; firstName: string; lastName: string; email: string };
  reviewer: { id: string; firstName: string; lastName: string } | null;
  product: { id: string; title: string; isActive: boolean } | null;
  collection: { id: string; name: string; published: boolean } | null;
};

export type AdminAppealDto = {
  id: string;
  statement: string;
  status: "OPEN" | "APPROVED" | "REJECTED";
  decisionNote: string | null;
  createdAt: string;
  appellant: { id: string; firstName: string; lastName: string; email: string };
  reviewer: { id: string; firstName: string; lastName: string } | null;
  report: {
    id: string;
    reason: "INACCURATE" | "COPYRIGHT" | "PROHIBITED" | "HARASSMENT" | "OTHER";
    product: { id: string; title: string; isActive: boolean } | null;
    collection: { id: string; name: string; published: boolean } | null;
  };
};

export type AdminDisputeDto = {
  id: string;
  type: "DAMAGE" | "NON_DELIVERY" | "AUTHENTICITY" | "COPYRIGHT" | "DIGITAL_ACCESS" | "OTHER";
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  reason: string;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  order: { id: string; total: number; status: string };
  claimant: { id: string; firstName: string; lastName: string; email: string };
};

export type AdminReviewDto = {
  id: string;
  rating: number;
  text: string;
  moderationStatus: "PUBLISHED" | "HIDDEN" | "REMOVED";
  moderationNote: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  product: { id: string; title: string };
};

export type AdminCertificateDto = {
  id: string;
  certificateNumber: string;
  status: "PENDING" | "VERIFIED" | "REVOKED";
  note: string | null;
  issuedAt: string;
  verifiedAt: string | null;
  revokedAt: string | null;
  product: { id: string; title: string; isActive: boolean };
  artist: { id: string; handle: string };
};
