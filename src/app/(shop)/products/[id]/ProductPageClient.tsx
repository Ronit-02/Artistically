"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useProduct } from "@/hooks/useProducts";
import { paintings, reviews } from "@/data";
import RatingStars from "@/components/ui/RatingStars";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import AccordionItem from "@/components/ui/AccordionItem";
import SpecRow from "@/components/ui/SpecRow";
import Breadcrumb from "@/components/ui/Breadcrumb";

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80",
];
const SIZES = ["5×7", "8×10", "12×16", "18×24"] as const;

export default function ProductPageClient({ productId }: { productId: number }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, setSearchQuery } = useAppStore();
  const { data: product, isLoading } = useProduct(productId);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string>("5×7");
  const [added, setAdded] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (isLoading) return <div className="min-h-screen animate-pulse bg-gray-50" />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const wishlisted = isWishlisted(product.id);
  const carouselImages = [product.image, ...ROOM_IMAGES];
  const related = paintings.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    addToCart({ ...product });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCategorySearch = () => {
    setSearchQuery(product.category);
    router.push("/search");
  };

  const artistId = product.id * 100;

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
            <button onClick={() => setCarouselIndex((carouselIndex - 1 + carouselImages.length) % carouselImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <Image src={carouselImages[carouselIndex]} alt={product.title} fill className="object-cover transition-opacity duration-300" sizes="(max-width: 768px) 100vw, 50vw"/>
            <button onClick={() => setCarouselIndex((carouselIndex + 1) % carouselImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 z-10 cursor-pointer hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {carouselImages.map((_, i) => (
                <button key={i} onClick={() => setCarouselIndex(i)} className={`w-2 h-2 rounded-full transition-all border-none cursor-pointer ${i === carouselIndex ? "bg-white w-5" : "bg-white/50"}`}/>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {carouselImages.map((img, i) => (
              <button key={i} onClick={() => setCarouselIndex(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 relative ${i === carouselIndex ? "border-gray-900" : "border-transparent"}`}>
                <Image src={img} alt="" fill className="object-cover" sizes="56px"/>
              </button>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Discover in interiors</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Room</span>
              <select className="text-xs border border-gray-300 rounded px-2 py-1 outline-none bg-white cursor-pointer">
                <option>Living Room</option><option>Bedroom</option><option>Office</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_IMAGES.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-video bg-gray-100 relative">
                  <Image src={img} alt="room" fill className="object-cover" sizes="150px"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Details */}
        <div className="md:w-1/2">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 leading-snug tracking-tight-heading">{product.title}</h1>
            <button onClick={() => toggleWishlist(product)} className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 transition-colors bg-transparent cursor-pointer" aria-label="Wishlist">
              <svg className={`w-4 h-4 ${wishlisted ? "text-pink-500 fill-pink-500" : "text-gray-400"}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          <button onClick={handleCategorySearch} className="text-[13px] text-gray-400 hover:text-accent-600 hover:underline transition-colors mb-3 bg-transparent border-none cursor-pointer p-0">{product.category}</button>

          <div className="mb-4">
            <RatingStars rating={product.rating} reviews={product.reviews} size="md" onStarClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}/>
          </div>

          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">₹{product.price.toLocaleString()}</p>
          {product.originalPrice && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              {product.discount && <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">{product.discount}% Off</span>}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white cursor-pointer">
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-600">−</button>
                <span className="px-4 py-2 text-sm font-medium text-gray-900 border-x border-gray-300 min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-600">+</button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="primary" fullWidth onClick={handleAdd}>{added ? "✓ ADDED TO CART" : "ADD TO CART"}</Button>
            <Button variant="secondary" onClick={() => router.push("/cart")}>View Cart</Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            {[
              { icon: "🚚", text: "Free delivery on orders over ₹2,000" },
              { icon: "↩️", text: "30-day easy returns" },
              { icon: "🔒", text: "Secure checkout" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>

          <div>
            <AccordionItem title="Product Specifications">
              <SpecRow icon="↔" text="24 inch x 36 inch print quality — vibrant colors, rich look"/>
              <SpecRow icon="📄" text="300gsm, 100% cotton rag, matte, acid-free, archival fine art paper"/>
            </AccordionItem>
            <AccordionItem title="Product Notes">
              <SpecRow icon="🌡" text="Keep away from direct sunlight for optimal longevity."/>
              <SpecRow icon="🧹" text="Gently dust or vacuum as needed."/>
            </AccordionItem>
            <AccordionItem title="Payment & Fulfillment">
              <SpecRow icon="💲" text="All prices are in Indian Rupees (INR)."/>
              <SpecRow icon="🌍" text="Ships within 4 business days from our studio."/>
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* About the creator */}
      <div className="mb-12 border-t border-gray-200 pt-10">
        <h2 className="font-heading text-xl font-semibold text-gray-900 mb-5">About the Creator</h2>
        <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 relative">
              <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt={product.artistName} fill className="object-cover" sizes="80px"/>
            </div>
            <div>
              <Link href={`/artists/${artistId}`} className="text-sm font-semibold text-[#111] hover:underline">{product.artistName}</Link>
              <p className="text-xs text-gray-500">India</p>
            </div>
          </div>
          <div className="flex-1">
            <RatingStars rating={4.5} reviews={72}/>
            <p className="text-sm text-gray-500 italic mt-2 mb-3">&quot;Art is the magic in my simple existence&quot;</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.artistName} is an award-winning artist whose paintings have been widely exhibited nationally.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {["Prizewinner", "Artistically Verified"].map((badge) => (
                <span key={badge} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  {badge}
                </span>
              ))}
              <Link href={`/artists/${artistId}`} className="text-xs text-gray-600 font-medium hover:underline">View full profile →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other artworks */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-semibold text-[#111]">Other Artworks by Creator</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {related.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      </div>

      {/* Reviews */}
      <div ref={reviewsRef} className="border-t border-gray-200 pt-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading text-xl font-semibold text-[#111]">Product Reviews</h2>
            <RatingStars rating={4.5} size="md"/>
            <span className="text-sm text-gray-500">34 Reviews</span>
          </div>
          <select className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none bg-white cursor-pointer">
            <option>Highest to Lowest</option>
            <option>Lowest to Highest</option>
            <option>Most Recent</option>
          </select>
        </div>
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-6">
              <RatingStars rating={r.rating}/>
              <p className="text-sm text-gray-700 mt-2 mb-2">{r.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[#111]">{r.author[0]}</div>
                <span className="text-xs text-gray-500">{r.author}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
