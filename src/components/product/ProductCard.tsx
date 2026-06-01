"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useAppStore } from "@/store/useAppStore";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { toggleWishlist, isWishlisted } = useAppStore();
  const wishlisted = isWishlisted(product.id);
  const artistId = product.id * 100;

  return (
    <div className="card-hover group relative">
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
        aria-label="Toggle wishlist"
      >
        <svg className={`w-[14px] h-[14px] transition-colors ${wishlisted ? "text-red-500 fill-red-500" : "text-gray-400"}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {product.badge && (
        <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold tracking-wider uppercase bg-[#111] text-white px-2 py-1 rounded-md">Limited</span>
      )}

      <div onClick={() => router.push(`/products/${product.id}`)} className="cursor-pointer img-hover-zoom rounded-xl bg-[#f5f5f5] overflow-hidden">
        <div className="aspect-[3/3.5] relative">
          <Image src={product.image} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"/>
        </div>
      </div>

      <div className="pt-3 pb-1 px-0.5">
        <button onClick={() => router.push(`/artists/${artistId}`)}
          className="text-[11px] text-gray-400 hover:text-accent-600 hover:underline font-medium mb-0.5 bg-transparent border-none cursor-pointer p-0 transition-colors">
          {product.artistName}
        </button>
        <h3 onClick={() => router.push(`/products/${product.id}`)}
          className="font-heading text-[14px] font-medium text-[#111] leading-snug line-clamp-1 mb-1.5 cursor-pointer">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#111]">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[11px] text-gray-300 line-through">₹{product.originalPrice.toLocaleString()}</span>}
          {product.discount && <span className="text-[10px] font-medium text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded">-{product.discount}%</span>}
        </div>
      </div>
    </div>
  );
}
