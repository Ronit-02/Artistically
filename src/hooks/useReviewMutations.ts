import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductReview } from "@/lib/api/reviews";
import { reviewKeys } from "@/hooks/useReviews";

export function useReviewMutations(productId: string) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (input: { rating: number; text: string }) => createProductReview({ productId, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) }),
  });

  return { create };
}
