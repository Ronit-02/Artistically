import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveProduct, createProduct, fetchProducts, fetchProductById, fetchProductPage, fetchRelatedProducts, updateProduct, type ProductListParams, type ProductMutationInput } from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams = {}) => ["products", "list", params] as const,
  detail: (id: string) => ["products", id] as const,
  related: (id: string, artistId?: string) => ["products", id, "related", artistId ?? null] as const,
};

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    enabled:
      params === undefined ||
      Object.values(params).some((value) => value !== undefined && value !== ""),
  });
}

export function useProductPage(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProductPage(params),
    enabled:
      params === undefined ||
      Object.values(params).some((value) => value !== undefined && value !== ""),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
}

export function useRelatedProducts(productId: string, artistId?: string) {
  return useQuery({
    queryKey: productKeys.related(productId, artistId),
    queryFn: () => fetchRelatedProducts(productId, artistId),
    enabled: !!productId && !!artistId,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: productKeys.all });

  return {
    create: useMutation({ mutationFn: (input: ProductMutationInput) => createProduct(input), onSuccess: invalidateProducts }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<ProductMutationInput> }) => updateProduct(id, input), onSuccess: invalidateProducts }),
    archive: useMutation({ mutationFn: archiveProduct, onSuccess: invalidateProducts }),
  };
}
