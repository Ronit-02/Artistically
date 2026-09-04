import type { CartItem } from "@/types";
import type { CartItemDto } from "@/types/api";
import { apiRequest } from "@/lib/api/client";
import { fromMinorUnits } from "@/lib/money";

export type AddCartInput = {
  productId: string;
  quantity?: number;
  size?: string;
};

export function mapCartItem(item: CartItemDto): CartItem {
  const artistName = `${item.product.artist.user.firstName} ${item.product.artist.user.lastName}`.trim();
  return {
    id: item.product.id,
    cartItemId: item.id,
    title: item.product.title,
    artist: artistName,
    artistName,
    rating: 0,
    reviews: 0,
    price: fromMinorUnits(item.product.price),
    stock: item.product.stock,
    originalPrice: item.product.originalPrice === null ? null : fromMinorUnits(item.product.originalPrice),
    discount: item.product.discount,
    image: item.product.images[0]?.url ?? "/paintings/painting-1.jpg",
    category: item.product.category,
    ...(item.product.badge ? { badge: item.product.badge } : {}),
    size: item.size,
    quantity: item.quantity,
  };
}

export async function fetchCart(): Promise<CartItem[]> {
  const items = await apiRequest<CartItemDto[]>("/api/cart");
  return items.map(mapCartItem);
}

export async function addToCart(input: AddCartInput): Promise<CartItem> {
  const item = await apiRequest<CartItemDto>("/api/cart", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapCartItem(item);
}

export async function updateCartItem(input: { itemId: string; quantity: number }): Promise<CartItem> {
  const item = await apiRequest<CartItemDto>(`/api/cart/${encodeURIComponent(input.itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity: input.quantity }),
  });
  return mapCartItem(item);
}

export async function removeCartItem(itemId: string): Promise<void> {
  await apiRequest<never>(`/api/cart/${encodeURIComponent(itemId)}`, { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  await apiRequest<never>("/api/cart", { method: "DELETE" });
}
