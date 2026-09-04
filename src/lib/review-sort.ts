import type { Review } from "@/types";

export type ReviewSort = "highest" | "lowest" | "recent";

export function sortReviews(reviews: readonly Review[], sort: ReviewSort): Review[] {
  return [...reviews].sort((left, right) => {
    if (sort === "highest" && right.rating !== left.rating) return right.rating - left.rating;
    if (sort === "lowest" && right.rating !== left.rating) return left.rating - right.rating;
    return Date.parse(right.date) - Date.parse(left.date);
  });
}
