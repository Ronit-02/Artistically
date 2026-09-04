import type { Review } from "@/types";
import type { ReviewDto, SellerReviewDto } from "@/types/api";
import { apiRequest } from "@/lib/api/client";

export function mapReview(review: ReviewDto): Review {
  const author = `${review.user.firstName} ${review.user.lastName}`.trim();
  return {
    id: review.id,
    author,
    date: review.createdAt,
    rating: review.rating,
    text: review.text,
    ...(review.verified !== undefined ? { verified: review.verified } : {}),
  };
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const query = new URLSearchParams({ productId });
  const reviews = await apiRequest<ReviewDto[]>(`/api/reviews?${query.toString()}`);
  return reviews.map(mapReview);
}

export async function createProductReview(input: {
  productId: string;
  rating: number;
  text: string;
}): Promise<Review> {
  const review = await apiRequest<ReviewDto>("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ productId: input.productId, rating: input.rating, text: input.text }),
  });
  return mapReview(review);
}

export async function fetchSellerReviews(): Promise<SellerReviewDto[]> {
  return apiRequest<SellerReviewDto[]>("/api/artist/reviews");
}
