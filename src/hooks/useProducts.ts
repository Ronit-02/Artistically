import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductById, fetchRelatedProducts } from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
  related: (id: number) => ["products", id, "related"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
}

export function useRelatedProducts(productId: number) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: () => fetchRelatedProducts(productId),
    enabled: !!productId,
  });
}
