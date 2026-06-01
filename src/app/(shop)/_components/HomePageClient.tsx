"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { paintings, sculptures, ceramics, artists, stories, collections, categoryImages, categoryArtworkCounts, categories } from "@/data";
import { useAppStore } from "@/store/useAppStore";
import ProductCard from "@/components/product/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ArtistCard from "@/components/artist/ArtistCard";
import Button from "@/components/ui/Button";

/* ── Auto-rotate Carousel ──────────────────────────────────────────────── */

const SLIDES = [
  { label: "Top Picks", title: "Curated artworks handpicked by our editors", cta: "Shop Top Picks", image: "/paintings/painting-4.jpg", query: "Paintings" },
  { label: "Trending Artists", title: "Discover the most popular creators this month", cta: "View Artists", image: "/paintings/painting-6.jpg", query: "" },
  { label: "New Arrivals", title: "Fresh originals just added to the marketplace", cta: "See New Art", image: "/paintings/painting-2.jpg", query: "" },
  { label: "Summer Sale", title: "Up to 40% off selected original artworks", cta: "Shop the Sale", image: "/ceramics/ceramic-2.jpg", query: "Ceramics" },
];

function Carousel({ onNavigate }: { onNavigate: (q: string) => void }) {
  const [idx, setIdx] = useState(0);
  const next = useCallback(() => setIdx(i => (i + 1) % SLIDES.length), []);
  const prev = () => setIdx(i => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t); }, [next]);

  const slide = SLIDES[idx];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-0 rounded-2xl overflow-hidden bg-[#f8f8f6] min-h-[320px] sm:min-h-[360px]">
      {/* Text side */}
      <div className="flex flex-col justify-center px-8 sm:px-12 py-10">
        <p className="text-[11px] font-medium text-accent-600 uppercase tracking-wider mb-3">{slide.label}</p>
        <h2 className="font-heading text-[1.5rem] sm:text-[2rem] font-bold text-[#111] leading-[1.15] tracking-tighter-heading mb-4">{slide.title}</h2>
        <div className="mb-6">
          <Button variant="primary" size="md" onClick={() => onNavigate(slide.query)}>{slide.cta}</Button>
        </div>
        {/* Dots + arrows */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${i === idx ? "bg-accent-600 w-5" : "bg-gray-300"}`}/>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            <button onClick={prev} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:border-accent-300 cursor-pointer transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={next} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:border-accent-300 cursor-pointer transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
      {/* Image side */}
      <div className="relative min-h-[240px] md:min-h-0 overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}>
            <Image src={s.image} alt={s.label} fill className="object-cover" sizes="55vw" priority={i === 0}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */

export default function HomePageClient() {
  const router = useRouter();
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const catSearch = (cat: string) => { setSearchQuery(cat); router.push("/search"); };
  const navigate = (q: string) => { if (q) catSearch(q); else router.push("/search"); };

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10">

      {/* ═══════ CAROUSEL — Auto-rotate: Top Picks / Trending / New / Sale ═══════ */}
      <section className="py-10 sm:py-12">
        <Carousel onNavigate={navigate}/>
      </section>

      {/* ═══════ CATEGORIES — Image grid ═══════ */}
      <section className="py-8 sm:py-10">
        <SectionHeader title="Browse by Category" subtitle="Find original art in these popular categories" href="/search" className="mb-6"/>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button key={cat} onClick={() => catSearch(cat)} className="group cursor-pointer border-none bg-transparent p-0 text-left">
              <div className="h-[180px] img-hover-zoom relative rounded-xl overflow-hidden bg-[#f5f5f5] mb-2">
                <Image src={categoryImages[cat] || "/paintings/painting-1.jpg"} alt={cat} fill className="object-cover" sizes="(max-width: 640px) 33vw, 16vw"/>
              </div>
              <p className="text-[12px] font-medium text-[#111] text-center">{cat}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURED PAINTINGS ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <SectionHeader title="Featured Paintings" onLinkClick={() => catSearch("Paintings")} className="mb-6"/>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paintings.slice(0, 5).map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      {/* ═══════ EDITOR'S PICK — Etsy-inspired: text left + images right + product row ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Text */}
          <div className="flex flex-col pr-4 col-span-2">
            <p className="text-[11px] font-medium text-accent-600 uppercase tracking-wider mb-2">Editor&apos;s Picks</p>
            <h2 className="font-heading text-[1.5rem] sm:text-[1.75rem] font-bold text-[#111] leading-[1.15] tracking-tighter-heading mb-3">The Sculpture Collection</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-5">Hand-selected sculptures and three-dimensional artworks that bring space, form, and texture into your home.</p>
            <div>
              <button onClick={() => catSearch("Sculptures")} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#111] bg-[#f5f5f5] hover:bg-[#eee] px-5 py-2.5 rounded-full border-none cursor-pointer transition-colors">
                Shop these unique finds
              </button>
            </div>
          </div>
          {/* Products */}
          {sculptures.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      {/* ═══════ CERAMICS ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <SectionHeader title="Ceramics & Pottery" onLinkClick={() => catSearch("Ceramics")} className="mb-6"/>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ceramics.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      {/* ═══════ COLLECTIONS — Text below image (not overlay) ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <SectionHeader title="Curated Collections" href="/collections" className="mb-6"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.filter(c => c.featured).map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="card-hover group block">
              <div className="img-hover-zoom relative aspect-[16/10] rounded-xl overflow-hidden bg-[#f5f5f5] mb-3">
                <Image src={c.coverImage} alt={c.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>
              </div>
              <p className="text-[11px] font-medium text-accent-600 uppercase tracking-wider mb-1">{c.artworkCount} artworks</p>
              <h3 className="font-heading text-[15px] font-medium text-[#111] leading-snug">{c.name}</h3>
              <p className="text-[12px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ HERO — Singulart-inspired: large left + text+image right ═══════ */}
      <section className="py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
          {/* Left — Large feature */}
          <div className="relative rounded-2xl overflow-hidden bg-[#f5f5f5] min-h-[360px] sm:min-h-[460px] group cursor-pointer img-hover-zoom" onClick={() => catSearch("Paintings")}>
            <Image src="/paintings/painting-1.jpg" alt="Featured" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" priority/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h1 className="font-heading text-[1.5rem] sm:text-[2.25rem] font-bold text-white leading-[1.12] tracking-tighter-heading mb-2 max-w-md">Buy art from the world&apos;s best artists</h1>
              <p className="text-[13px] text-white/60 mb-4 max-w-sm leading-relaxed">Discover bold, inspiring creations to elevate your space — curated just for you</p>
              <span className="link-arrow inline-flex items-center gap-2 text-[13px] font-medium text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors">
                Start discovering <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>

          {/* Right — 2 stacked: image + text beside each */}
          <div className="grid grid-rows-2 gap-5">
            <div className="flex gap-4">
              <Link href={`/collections/${collections[0].id}`} className="relative w-2/5 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 img-hover-zoom">
                <Image src={collections[0].coverImage} alt={collections[0].name} fill className="object-cover" sizes="20vw"/>
              </Link>
              <div className="flex-1 flex flex-col justify-center py-1">
                <p className="text-[11px] font-medium text-accent-600 uppercase tracking-wider mb-1.5">Collection</p>
                <h3 className="font-heading text-[18px] sm:text-[22px] font-semibold text-[#111] leading-snug mb-1.5">{collections[0].name}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{collections[0].description}</p>
                <Link href={`/collections/${collections[0].id}`} className="link-arrow inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111] border-b border-gray-300 pb-0.5 hover:text-accent-600 hover:border-accent-600 transition-colors w-fit">
                  View artworks <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href={`/artists/${artists[0].id}`} className="relative w-2/5 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 img-hover-zoom">
                <Image src={artists[0].cover} alt={artists[0].name} fill className="object-cover" sizes="20vw"/>
              </Link>
              <div className="flex-1 flex flex-col justify-center py-1">
                <p className="text-[11px] font-medium text-accent-600 uppercase tracking-wider mb-1.5">Featured Artist</p>
                <h3 className="font-heading text-[18px] sm:text-[22px] font-semibold text-[#111] leading-snug mb-1.5">{artists[0].name}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed mb-3">{artists[0].designs} original artworks available</p>
                <Link href={`/artists/${artists[0].id}`} className="link-arrow inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111] border-b border-gray-300 pb-0.5 hover:text-accent-600 hover:border-accent-600 transition-colors w-fit">
                  View artist <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ARTISTS — Horizontal scroll ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <SectionHeader title="Featured Artists" className="mb-6"/>
        <div className="flex gap-5 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {artists.map((a) => (
            <div key={a.id} className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start">
              <ArtistCard artist={a}/>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ STORIES — Text below image (blog style, ref 4) ═══════ */}
      <section className="py-10 sm:py-12 border-t border-gray-100">
        <SectionHeader title="Fresh from the Blog" className="mb-6"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.slice(0, 3).map((s) => (
            <Link key={s.id} href={`/stories/${s.id}`} className="card-hover group block">
              <div className="img-hover-zoom relative aspect-square rounded-xs overflow-hidden bg-[#f5f5f5] mb-3">
                <Image src={s.image} alt={s.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>
                {s.category && (
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium bg-white/90 backdrop-blur-sm text-[#111] px-2.5 py-1 rounded-md">{s.category}</span>
                )}
              </div>
              <h3 className="font-heading text-[16px] font-semibold text-[#111] leading-snug line-clamp-2 mb-1.5">{s.title}</h3>
              {s.excerpt && <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">{s.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
