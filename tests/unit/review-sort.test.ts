import { describe, expect, it } from "vitest";
import { sortReviews } from "@/lib/review-sort";

const reviews = [
  { id: "older-high", author: "A", date: "2026-08-20T00:00:00.000Z", rating: 5, text: "Great" },
  { id: "newer-low", author: "B", date: "2026-08-23T00:00:00.000Z", rating: 2, text: "Okay" },
  { id: "newer-high", author: "C", date: "2026-08-24T00:00:00.000Z", rating: 5, text: "Excellent" },
];

describe("sortReviews", () => {
  it("sorts highest ratings first and uses recency for ties", () => {
    expect(sortReviews(reviews, "highest").map((review) => review.id)).toEqual([
      "newer-high",
      "older-high",
      "newer-low",
    ]);
  });

  it("sorts lowest ratings first", () => {
    expect(sortReviews(reviews, "lowest").map((review) => review.id)).toEqual([
      "newer-low",
      "newer-high",
      "older-high",
    ]);
  });

  it("sorts recent reviews without mutating the input", () => {
    expect(sortReviews(reviews, "recent").map((review) => review.id)).toEqual([
      "newer-high",
      "newer-low",
      "older-high",
    ]);
    expect(reviews.map((review) => review.id)).toEqual(["older-high", "newer-low", "newer-high"]);
  });
});
