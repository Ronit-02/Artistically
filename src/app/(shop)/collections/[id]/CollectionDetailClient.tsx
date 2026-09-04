"use client";

import Image from "next/image";
import { useCollection } from "@/hooks/useCollections";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ReportForm from "@/components/forms/ReportForm";

export default function CollectionDetailClient({ collectionId }: { collectionId: string }) {
  const { data: collection, isLoading, isError, refetch } = useCollection(collectionId);

  if (isLoading) return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-20 text-sm text-gray-500" role="status">Loading collection…</div>;
  if (isError) return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-20 flex flex-col items-start gap-3 text-sm text-gray-500" role="alert"><p>Collection could not be loaded.</p><button type="button" onClick={() => refetch()} className="inline-flex min-h-11 items-center text-accent-600 underline">Try again</button></div>;
  if (!collection) return <div className="text-center py-20 text-gray-500">Collection not found.</div>;

  const products = collection.products;

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <Breadcrumb items={[{ label: "Collections", href: "/collections" }, { label: collection.name }]} className="mb-6"/>

      {/* Hero */}
      <div className="relative h-48 sm:h-72 rounded-2xl overflow-hidden mb-10 bg-[#f5f5f5]">
        <Image src={collection.coverImage} alt={collection.name} fill className="object-cover" sizes="100vw" priority/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"/>
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
          <h1 className="font-heading text-[2rem] sm:text-[2.75rem] font-bold text-white tracking-tighter-heading mb-2">{collection.name}</h1>
          <span className="text-sm text-white/80">Artistically Editorial</span>
        </div>
      </div>

      <p className="text-[15px] text-gray-500 leading-relaxed max-w-2xl mb-10">{collection.description}</p>

      <div className="mb-10">
        <ReportForm targetType="COLLECTION" targetId={String(collection.id)} targetLabel={collection.name} />
      </div>

      <h2 className="font-heading text-[22px] font-semibold text-[#111] tracking-tight-heading mb-2">Explore available artworks</h2>
      <p className="text-sm text-gray-500 mb-8">Artwork selected for this collection from the published catalog.</p>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">No published artworks are available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      )}
    </div>
  );
}
