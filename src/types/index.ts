// ─── Product ────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  title: string;
  artist: string;
  artistName: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  category: string;
  badge?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

// ─── Artist ──────────────────────────────────────────────────────────────────

export interface Artist {
  id: number;
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
  id: number;
  title: string;
  date: string;
  image: string;
  excerpt?: string;
  category?: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  text: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number;
  title: string;
  artist: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  status?: "delivered" | "in-transit" | "processing";
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
  id: number;
  name: string;
  description: string;
  coverImage: string;
  artworkCount: number;
  curatorName: string;
  curatorAvatar: string;
  featured?: boolean;
  tags?: string[];
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
