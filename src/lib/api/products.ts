import type { ArtworkDetails, Product } from "@/types";
import { apiRequest, apiRequestPaginated, ApiClientError } from "@/lib/api/client";
import type { ProductDto } from "@/types/api";
import { fromMinorUnits } from "@/lib/money";

export type ProductListParams = {
  artistId?: string;
  search?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  priceRanges?: string[];
  minRating?: number;
  minRatings?: number[];
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
};

export type ProductCategoryInput =
  | "PAINTINGS"
  | "SCULPTURES"
  | "CERAMICS"
  | "DIGITAL_ART"
  | "GLASS_ART"
  | "WOODWORK"
  | "PHOTOGRAPHY"
  | "TEXTILE";

export type ProductPage = {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type ProductMutationInput = {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: ProductCategoryInput;
  badge?: string;
  stock?: number;
  images: string[];
  artworkDetails?: Partial<ArtworkDetails>;
};

export function mapProduct(product: ProductDto): Product {
  const artistName = `${product.artist.user.firstName} ${product.artist.user.lastName}`.trim();
  return {
    id: product.id,
    artistId: product.artist.id,
    title: product.title,
    description: product.description,
    artist: artistName,
    artistName,
    ...(product.artist.user.avatar ? { artistImage: product.artist.user.avatar } : {}),
    rating: product.rating ?? 0,
    reviews: product.reviewCount ?? 0,
    price: fromMinorUnits(product.price),
    stock: product.stock,
    originalPrice: product.originalPrice === null ? null : fromMinorUnits(product.originalPrice),
    discount: product.discount,
    image: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? "/paintings/painting-1.jpg",
    images: product.images.map((image) => image.url),
    category: product.category,
    ...(product.badge ? { badge: product.badge } : {}),
    ...(product.artworkDetails ? { artworkDetails: product.artworkDetails } : {}),
  };
}

export async function fetchProducts(params?: ProductListParams): Promise<Product[]> {
  const query = buildProductQuery(params);
  const response = await apiRequest<ProductDto[]>(`/api/products?${query.toString()}`);
  return response.map(mapProduct);
}

export async function fetchProductPage(params?: ProductListParams): Promise<ProductPage> {
  const query = buildProductQuery(params);
  const response = await apiRequestPaginated<ProductDto[]>(`/api/products?${query.toString()}`);
  return { products: response.data.map(mapProduct), pagination: response.pagination };
}

function buildProductQuery(params?: ProductListParams) {
  const query = new URLSearchParams({ limit: String(params?.limit ?? 50) });
  if (params?.artistId) query.set("artistId", params.artistId);
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  params?.categories?.forEach((category) => query.append("category", category));
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  params?.priceRanges?.forEach((range) => query.append("priceRange", range));
  if (params?.minRating !== undefined) query.set("minRating", String(params.minRating));
  params?.minRatings?.forEach((rating) => query.append("minRating", String(rating)));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.page !== undefined) query.set("page", String(params.page));
  return query;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return mapProduct(await apiRequest<ProductDto>(`/api/products/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchRelatedProducts(productId: string, artistId?: string): Promise<Product[]> {
  const products = await fetchProducts(artistId ? { artistId } : undefined);
  return products.filter((p) => p.id !== productId).slice(0, 4);
}

export async function createProduct(input: ProductMutationInput): Promise<ProductDto> {
  return apiRequest<ProductDto>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: Partial<ProductMutationInput>): Promise<ProductDto> {
  return apiRequest<ProductDto>(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  await apiRequest<never>(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}
