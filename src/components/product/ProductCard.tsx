"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useWishlist, useWishlistMutations } from "@/hooks/useWishlist";
import { isProductSold } from "@/lib/product-availability";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { data: wishlist = [], currentUser, isAuthPending } = useWishlist();
  const { add, remove } = useWishlistMutations();
  const wishlisted = wishlist.some((item) => item.id === product.id);
  const wishlistPending = add.isPending || remove.isPending;
  const artistId = product.artistId;
  const isSold = isProductSold(product.stock);

  const handleWishlist = () => {
    if (isAuthPending) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (wishlisted) remove.mutate(String(product.id));
    else add.mutate(String(product.id));
  };

  return (
    <div className="card-hover group relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleWishlist(); }}
        disabled={wishlistPending || isAuthPending}
        className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-all duration-200 shadow-sm disabled:cursor-not-allowed"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
      >
        <svg aria-hidden="true" className={`w-[14px] h-[14px] transition-colors ${wishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {(isSold || product.badge) && (
        <span className={`absolute top-3 left-3 z-10 text-[12px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md ${isSold ? "bg-gray-600 text-white" : "bg-[#111] text-white"}`}>
          {isSold ? "Sold" : product.badge}
        </span>
      )}

      <Link href={`/products/${product.id}`} className="block cursor-pointer img-hover-zoom rounded-xl bg-[#f5f5f5] overflow-hidden">
        <div className="aspect-[3/3.5] relative">
          <Image src={product.image} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"/>
        </div>
      </Link>

      <div className="pt-3 pb-1 px-0.5">
        <Link href={artistId ? `/artists/${artistId}` : "/artists"}
          className="inline-block text-[12px] text-gray-500 hover:text-accent-600 hover:underline font-medium mb-0.5 transition-colors">
          {product.artistName}
        </Link>
        <Link href={`/products/${product.id}`}
          className="block font-heading text-[14px] font-medium text-[#111] leading-snug line-clamp-1 mb-1.5">
          {product.title}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[#111]">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[12px] text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>}
          {product.discount && <span className="text-[12px] font-medium text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded">-{product.discount}%</span>}
        </div>
        {(add.isError || remove.isError) && (
          <p role="alert" className="text-[12px] text-red-600 mt-1">Couldn’t update wishlist. Try again.</p>
        )}
      </div>
    </div>
  );
}
