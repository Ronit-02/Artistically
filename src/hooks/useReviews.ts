import { useQuery } from "@tanstack/react-query";
import { fetchProductReviews, fetchSellerReviews } from "@/lib/api/reviews";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const reviewKeys = {
  product: (productId: string) => ["reviews", "product", productId] as const,
};

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });
}

export function useSellerReviews() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: ["seller-reviews", currentUser?.id ?? "anonymous"],
    queryFn: fetchSellerReviews,
    enabled: !!currentUser && (currentUser.role === "ARTIST" || currentUser.role === "ADMIN"),
  });
  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}
