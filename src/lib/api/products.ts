import type { Product } from "@/types";
import { allProducts, paintings } from "@/data";

// In a real app these would be fetch() calls to /api/products
// Structured this way so swapping to real API requires only changing this file

export async function fetchProducts(): Promise<Product[]> {
  return allProducts;
}

export async function fetchProductById(id: number): Promise<Product | null> {
  return allProducts.find((p) => p.id === id) ?? null;
}

export async function fetchRelatedProducts(productId: number): Promise<Product[]> {
  return paintings.filter((p) => p.id !== productId).slice(0, 4);
}
