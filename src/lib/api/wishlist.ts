import type { Product } from "@/types";
import type { WishlistItemDto } from "@/types/api";
import { apiRequest } from "@/lib/api/client";
import { fromMinorUnits } from "@/lib/money";

export function mapWishlistItem(item: WishlistItemDto): Product {
  const artistName = `${item.product.artist.user.firstName} ${item.product.artist.user.lastName}`.trim();
  return {
    id: item.product.id,
    title: item.product.title,
    artist: artistName,
    artistName,
    rating: 0,
    reviews: 0,
    price: fromMinorUnits(item.product.price),
    originalPrice: item.product.originalPrice === null ? null : fromMinorUnits(item.product.originalPrice),
    discount: item.product.discount,
    image: item.product.images[0]?.url ?? "/paintings/painting-1.jpg",
    category: item.product.category,
    ...(item.product.badge ? { badge: item.product.badge } : {}),
  };
}

export async function fetchWishlist(): Promise<Product[]> {
  const items = await apiRequest<WishlistItemDto[]>("/api/wishlist");
  return items.map(mapWishlistItem);
}

export async function addToWishlist(productId: string): Promise<void> {
  await apiRequest<WishlistItemDto>("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiRequest<never>(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
}
