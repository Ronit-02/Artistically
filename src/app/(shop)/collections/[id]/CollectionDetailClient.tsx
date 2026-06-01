"use client";

import Image from "next/image";
import { collections, allProducts } from "@/data";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CollectionDetailClient({ collectionId }: { collectionId: number }) {
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return <div className="text-center py-20 text-gray-400">Collection not found.</div>;

  const artworks = allProducts.slice(0, Math.min(collection.artworkCount, 8));

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <Breadcrumb items={[{ label: "Collections", href: "/collections" }, { label: collection.name }]} className="mb-6"/>

      {/* Hero */}
      <div className="relative h-48 sm:h-72 rounded-2xl overflow-hidden mb-10 bg-[#f5f5f5]">
        <Image src={collection.coverImage} alt={collection.name} fill className="object-cover" sizes="100vw" priority/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"/>
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
          <h1 className="font-heading text-[2rem] sm:text-[2.75rem] font-bold text-white tracking-tighter-heading mb-2">{collection.name}</h1>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/50 relative">
              <Image src={collection.curatorAvatar} alt="" fill className="object-cover" sizes="24px"/>
            </div>
            <span className="text-sm text-white/80">{collection.curatorName}</span>
            <span className="text-sm text-white/40">· {collection.artworkCount} artworks</span>
          </div>
        </div>
      </div>

      <p className="text-[15px] text-gray-400 leading-relaxed max-w-2xl mb-10">{collection.description}</p>

      <h2 className="font-heading text-[22px] font-semibold text-[#111] tracking-tight-heading mb-8">Artworks in this Collection</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {artworks.map((p) => <ProductCard key={p.id} product={p}/>)}
      </div>
    </div>
  );
}
