"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useProduct, useRelatedProducts } from "@/hooks/useProducts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCartMutations } from "@/hooks/useCart";
import { useWishlist, useWishlistMutations } from "@/hooks/useWishlist";
import { useProductReviews } from "@/hooks/useReviews";
import { useReviewMutations } from "@/hooks/useReviewMutations";
import RatingStars from "@/components/ui/RatingStars";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ReportForm from "@/components/forms/ReportForm";
import { sortReviews, type ReviewSort } from "@/lib/review-sort";
import type { ArtworkDetails } from "@/types";

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80",
];

const ARTWORK_TYPE_LABELS: Record<ArtworkDetails["artworkType"], string> = {
  ORIGINAL: "Original",
  LIMITED_EDITION: "Limited edition",
  MADE_TO_ORDER: "Made to order",
  DIGITAL: "Digital",
};

function getArtworkSpecifications(details: ArtworkDetails) {
  const dimensions = [details.width, details.height, details.depth]
    .filter((value): value is number => value !== null && value !== undefined)
    .join(" × ");
  const dimensionText = dimensions
    ? `${dimensions} ${details.dimensionUnit ?? "cm"}`
    : null;
  const editionText = details.editionSize
    ? `${details.editionNumber ? `No. ${details.editionNumber} of ` : ""}${details.editionSize}`
    : null;

  return [
    ["Artwork type", ARTWORK_TYPE_LABELS[details.artworkType]],
    ["Medium", details.medium],
    ["Materials", details.materials],
    ["Dimensions", dimensionText],
    ["Year", details.year?.toString()],
    ["Condition", details.condition],
    ["Framing", details.framing],
    ["Edition", editionText],
    ["Authenticity", details.authenticity],
    ["Provenance", details.provenance],
    ["Fulfillment", details.fulfillmentMode === "DIGITAL" ? "Digital" : "Physical"],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
}

export default function ProductPageClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { setSearchQuery } = useAppStore();
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const { data: wishlist = [] } = useWishlist();
  const { add: addToCart } = useCartMutations();
  const { add: addToWishlist, remove: removeFromWishlist } = useWishlistMutations();
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const {
    data: relatedProducts = [],
    isLoading: relatedLoading,
    isError: relatedError,
    refetch: refetchRelated,
  } = useRelatedProducts(productId, product?.artistId);
  const {
    data: productReviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useProductReviews(productId);
  const { create: createReview } = useReviewMutations(productId);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [reviewSort, setReviewSort] = useState<ReviewSort>("recent");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const sortedReviews = useMemo(() => sortReviews(productReviews, reviewSort), [productReviews, reviewSort]);
  const productStock = product?.stock;
  const productQuantityLimit = productStock !== undefined ? Math.max(1, productStock) : 1;

  if (isLoading) return <div className="min-h-screen animate-pulse bg-gray-50" />;
  if (isError) return (
    <div className="mx-auto max-w-xl py-20 text-center" role="alert">
      <p className="text-sm text-gray-500">This artwork could not be loaded.</p>
      <button type="button" onClick={() => refetch()} className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-600 underline hover:text-accent-700 cursor-pointer">
        Try again
      </button>
    </div>
  );
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const wishlisted = wishlist.some((item) => item.id === product.id);
  const carouselImages = product.images?.length ? product.images : [product.image];
  const stock = productStock;
  const isOutOfStock = stock !== undefined && stock <= 0;
  const quantityLimit = productQuantityLimit;
  const boundedQuantity = Math.min(qty, quantityLimit);
  const artworkSpecifications = product.artworkDetails
    ? getArtworkSpecifications(product.artworkDetails)
    : [];
  const related = relatedProducts.slice(0, 3);
  const reviewAverage = productReviews.length > 0
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : product.rating;
  const reviewCount = productReviews.length > 0 ? productReviews.length : product.reviews;

  const handleAdd = () => {
    if (isAuthPending || isOutOfStock) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    addToCart.mutate({ productId: String(product.id), quantity: boundedQuantity }, {
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      },
    });
  };

  const handleWishlist = () => {
    if (isAuthPending) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (wishlisted) removeFromWishlist.mutate(String(product.id));
    else addToWishlist.mutate(String(product.id));
  };

  const handleCategorySearch = () => {
    setSearchQuery(product.category);
    router.push("/search");
  };

  const handleReviewSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || reviewRating === 0 || reviewText.trim().length < 10) return;
    createReview.mutate({ rating: reviewRating, text: reviewText.trim() }, {
      onSuccess: () => {
        setReviewRating(0);
        setReviewText("");
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 3000);
      },
    });
  };

  const artistId = product.artistId;

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-6 sm:py-8">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: product.category, onClick: handleCategorySearch },
          { label: product.title },
        ]}
        className="mb-6"
      />

      {/* Top: image + details */}
      <div className="flex flex-col md:flex-row gap-8 sm:gap-10 mb-12">

        {/* LEFT — Carousel */}
        <div className="md:w-1/2 space-y-3">
          <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-[4/5]">
            <button type="button" aria-label="Previous product image" onClick={() => setCarouselIndex((carouselIndex - 1 + carouselImages.length) % carouselImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <Image src={carouselImages[carouselIndex]} alt={product.title} fill className="object-cover transition-opacity duration-300" sizes="(max-width: 768px) 100vw, 50vw"/>
            <button type="button" aria-label="Next product image" onClick={() => setCarouselIndex((carouselIndex + 1) % carouselImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {carouselImages.map((_, i) => (
                <button type="button" key={i} aria-label={`Show product image ${i + 1}`} aria-pressed={i === carouselIndex} onClick={() => setCarouselIndex(i)} className="w-11 h-11 rounded-full transition-all border-none cursor-pointer flex items-center justify-center bg-transparent">
                  <span aria-hidden="true" className={`block h-2 rounded-full transition-all ${i === carouselIndex ? "bg-white w-5" : "bg-white/50 w-2"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {carouselImages.map((img, i) => (
              <button type="button" key={i} aria-label={`Show product image ${i + 1}`} aria-pressed={i === carouselIndex} onClick={() => setCarouselIndex(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 relative ${i === carouselIndex ? "border-gray-900" : "border-transparent"}`}>
                <Image src={img} alt="" fill className="object-cover" sizes="56px"/>
              </button>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Approximate room preview</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Room</span>
              <select aria-label="Preview room" className="text-xs border border-gray-300 rounded px-2 py-1 outline-none bg-white cursor-pointer">
                <option>Living Room</option><option>Bedroom</option><option>Office</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_IMAGES.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-video bg-gray-100 relative">
                  <Image src={img} alt="Approximate room preview" fill className="object-cover" sizes="150px"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Details */}
        <div className="md:w-1/2">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 leading-snug tracking-tight-heading">{product.title}</h1>
            <button type="button" onClick={handleWishlist} disabled={isAuthPending || addToWishlist.isPending || removeFromWishlist.isPending} className="flex-shrink-0 w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 transition-colors bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wishlisted}>
              <svg className={`w-4 h-4 ${wishlisted ? "text-pink-500 fill-pink-500" : "text-gray-500"}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          <button type="button" onClick={handleCategorySearch} className="text-[13px] text-gray-500 hover:text-accent-600 hover:underline transition-colors mb-3 bg-transparent border-none cursor-pointer p-0">{product.category}</button>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
          )}

          <div className="mb-4">
            <RatingStars rating={product.rating} reviews={product.reviews} size="md" onStarClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}/>
          </div>

          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">₹{product.price.toLocaleString()}</p>
          {product.originalPrice && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              {product.discount && <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">{product.discount}% Off</span>}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, boundedQuantity - 1))} className="min-w-11 min-h-11 px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-600">−</button>
                <span className="px-4 py-2 text-sm font-medium text-gray-900 border-x border-gray-300 min-w-[2.5rem] text-center">{boundedQuantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(quantityLimit, boundedQuantity + 1))} disabled={stock !== undefined && boundedQuantity >= quantityLimit} className="min-w-11 min-h-11 px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40">+</button>
              </div>
            </div>
            <p className={`text-xs ${isOutOfStock ? "text-red-600" : "text-gray-500"}`} role={isOutOfStock ? "status" : undefined}>
              {isOutOfStock ? "Currently unavailable" : stock !== undefined ? `${stock} available` : "Availability checked at checkout"}
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="primary" fullWidth onClick={handleAdd} disabled={addToCart.isPending || isOutOfStock}>{isOutOfStock ? "UNAVAILABLE" : added ? "✓ ADDED TO CART" : addToCart.isPending ? "ADDING…" : "ADD TO CART"}</Button>
            <Button variant="secondary" onClick={() => router.push("/cart")}>View Cart</Button>
          </div>

        </div>
      </div>

      {artworkSpecifications.length > 0 && (
        <section aria-labelledby="artwork-details-heading" className="mb-12 border-t border-gray-200 pt-10">
          <h2 id="artwork-details-heading" className="font-heading text-xl font-semibold text-gray-900 mb-5">Artwork details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {artworkSpecifications.map(([label, value]) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-700 mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* About the creator */}
      <div className="mb-12 border-t border-gray-200 pt-10">
        <h2 className="font-heading text-xl font-semibold text-gray-900 mb-5">About the Creator</h2>
        <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 relative">
              {product.artistImage ? (
                <Image src={product.artistImage} alt={product.artistName} fill className="object-cover" sizes="80px"/>
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500" aria-hidden="true">
                  {product.artistName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <Link href={artistId ? `/artists/${artistId}` : "/artists"} className="text-sm font-semibold text-[#111] hover:underline">{product.artistName}</Link>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 leading-relaxed">View the artist profile for available work and verified information.</p>
            <Link href={artistId ? `/artists/${artistId}` : "/artists"} className="inline-block text-xs text-gray-600 font-medium hover:underline mt-3">View full profile →</Link>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <ReportForm targetType="PRODUCT" targetId={String(product.id)} targetLabel={product.title} />
      </div>

      {/* Other artworks */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-semibold text-[#111]">Other Artworks by Creator</h2>
        </div>
        {relatedLoading ? (
          <p className="text-sm text-gray-500">Loading related artworks…</p>
        ) : relatedError ? (
          <div className="flex flex-col items-start gap-2 text-sm text-gray-500" role="alert">
            <p>Related artworks could not be loaded.</p>
            <Button variant="secondary" onClick={() => refetchRelated()}>Try Again</Button>
          </div>
        ) : related.length === 0 ? (
          <p className="text-sm text-gray-500">No other published artworks by this artist yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div ref={reviewsRef} className="border-t border-gray-200 pt-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading text-xl font-semibold text-[#111]">Product Reviews</h2>
            <RatingStars rating={reviewAverage} size="md"/>
            <span className="text-sm text-gray-500">{reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}</span>
          </div>
          <select aria-label="Sort product reviews" value={reviewSort} onChange={(event) => setReviewSort(event.target.value as ReviewSort)} className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none bg-white cursor-pointer">
            <option value="highest">Highest to Lowest</option>
            <option value="lowest">Lowest to Highest</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          {isAuthPending ? (
            <p className="text-sm text-gray-500">Checking your account…</p>
          ) : !currentUser ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Sign in to review artwork you have received.</p>
              <Button variant="secondary" onClick={() => router.push("/login")}>Sign in to review</Button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4" noValidate>
              <div>
                <h3 className="font-heading text-base font-semibold text-[#111]">Share your experience</h3>
                <p className="text-sm text-gray-500 mt-1">Reviews are available after a delivered purchase.</p>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Rating</span>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Review rating">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-checked={reviewRating === value}
                        onClick={() => setReviewRating(value)}
                         className="min-w-11 min-h-11 rounded-md bg-transparent border-none cursor-pointer text-xl leading-none hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                      >
                        <span className={value <= reviewRating ? "text-yellow-400" : "text-gray-500"}>★</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="product-review" className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  id="product-review"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  placeholder="What would you like other collectors to know?"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-50"
                />
                <p className="text-xs text-gray-500 mt-1">At least 10 characters.</p>
              </div>
              {createReview.isError && (
                <p role="alert" className="text-sm text-red-600">{createReview.error.message}</p>
              )}
              {reviewSubmitted && (
                <p role="status" className="text-sm text-green-700">Your review was submitted.</p>
              )}
              <Button type="submit" variant="primary" disabled={createReview.isPending || reviewRating === 0 || reviewText.trim().length < 10}>
                {createReview.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          )}
        </div>
        <div className="space-y-6">
          {reviewsLoading ? (
            <p className="text-sm text-gray-500">Loading reviews…</p>
          ) : reviewsError ? (
            <div className="flex flex-col items-start gap-2 text-sm text-gray-500" role="alert">
              <p>Reviews could not be loaded.</p>
              <button type="button" onClick={() => refetchReviews()} className="inline-flex min-h-11 items-center text-accent-600 underline hover:text-accent-700 cursor-pointer">
                Try again
              </button>
            </div>
          ) : productReviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : sortedReviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-6">
              <RatingStars rating={r.rating}/>
              <p className="text-sm text-gray-700 mt-2 mb-2">{r.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[#111]">{r.author[0]}</div>
                <span className="text-xs text-gray-500">{r.author}</span>
                <span className="text-xs text-gray-500">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
