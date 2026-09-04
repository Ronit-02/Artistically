// ─── Product ────────────────────────────────────────────────────────────────

export interface Product {
  id: string | number;
  artistId?: string;
  title: string;
  artist: string;
  artistName: string;
  artistImage?: string;
  description?: string | null;
  rating: number;
  reviews: number;
  price: number;
  stock?: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  artworkDetails?: ArtworkDetails;
}

export interface ArtworkDetails {
  artworkType: "ORIGINAL" | "LIMITED_EDITION" | "MADE_TO_ORDER" | "DIGITAL";
  medium?: string | null;
  materials?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  dimensionUnit?: string;
  year?: number | null;
  condition?: string | null;
  framing?: string | null;
  editionSize?: number | null;
  editionNumber?: number | null;
  authenticity?: string | null;
  provenance?: string | null;
  fulfillmentMode: "PHYSICAL" | "DIGITAL";
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  quantity: number;
  size: string;
  cartItemId?: string;
}

// ─── Artist ──────────────────────────────────────────────────────────────────

export interface Artist {
  id: string | number;
  name: string;
  handle: string;
  followers: string;
  avatar: string;
  cover: string;
  designs: number;
  bio?: string;
  verified?: boolean;
}

// ─── Story ───────────────────────────────────────────────────────────────────

export interface Story {
  id: string | number;
  title: string;
  date: string;
  image: string;
  excerpt?: string;
  category?: string;
  content?: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string | number;
  author: string;
  date: string;
  rating: number;
  text: string;
  verified?: boolean;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string | number;
  orderId?: string;
  title: string;
  artist: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  status?: "delivered" | "in-transit" | "processing" | "cancelled";
  size?: string;
  date?: string;
}

// ─── Tracking ────────────────────────────────────────────────────────────────

export interface TrackingItem {
  id: number;
  title: string;
  artist: string;
  size: string;
  price: number;
  qty: number | null;
  image: string;
}

export interface OrderStep {
  n: number;
  title: string;
  sub: string;
  active: boolean;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
}

// ─── Search Filters ──────────────────────────────────────────────────────────

export interface SearchFilters {
  artTypes: string[];
  priceRanges: string[];
  ratings: number[];
  sortBy: SortOption;
}

export type SortOption =
  | "Price: ascending"
  | "Price: descending"
  | "Most Popular"
  | "Newest";

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = "collector" | "artist";

// ─── Collection ──────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  artworkCount: number;
  featured?: boolean;
}

// ─── Search Result ───────────────────────────────────────────────────────────

export type SearchResultType = "artwork" | "artist" | "category" | "collection";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
}
