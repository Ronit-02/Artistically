"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";

export default function WishlistPage() {
  const router = useRouter();
  const { data: wishlist = [], currentUser, isAuthPending, isLoading, isError, refetch } = useWishlist();

  if (isAuthPending || (currentUser && isLoading)) {
    return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center text-sm text-gray-500">Loading your wishlist…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Sign in to view your wishlist</h1>
        <p className="text-[15px] text-gray-500 mb-8">Save artwork to your account and find it here anytime.</p>
        <Button variant="primary" onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">We couldn’t load your wishlist</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your saved items are safe. Try loading the wishlist again.</p>
        <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h2 className="font-heading text-[22px] font-semibold text-[#111] mb-2">Your wishlist is empty</h2>
        <p className="text-[15px] text-gray-500 mb-8">Save artworks you love and come back to them anytime.</p>
        <Button variant="primary" onClick={() => router.push("/")}>Discover Art</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-heading text-[26px] sm:text-[30px] font-semibold text-[#111] tracking-tight-heading">My Wishlist</h1>
          <p className="text-[13px] text-gray-500 mt-1">{wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {wishlist.map((p) => <ProductCard key={p.id} product={p}/>)}
      </div>
    </div>
  );
}
