"use client";

import Image from "next/image";
import Link from "next/link";
import { useCollections } from "@/hooks/useCollections";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CollectionsPage() {
  const { data: collections = [], isLoading, isError, refetch } = useCollections();

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <Breadcrumb items={[{ label: "Collections" }]} className="mb-6" />
      <h1 className="font-heading text-[2rem] sm:text-[2.75rem] font-bold text-[#111] tracking-tighter-heading mb-2">
        Curated Collections
      </h1>
      <p className="text-[15px] text-gray-500 mb-10 max-w-xl leading-relaxed">
        Thoughtfully curated groupings that bring together artworks united by theme, medium, or vision.
      </p>
      {isLoading ? (
        <p className="text-sm text-gray-500" role="status">Loading collections…</p>
      ) : isError ? (
        <div className="flex flex-col items-start gap-3 text-sm text-gray-500" role="alert">
          <p>Collections could not be loaded.</p>
          <button type="button" onClick={() => refetch()} className="inline-flex min-h-11 items-center text-accent-600 underline hover:text-accent-700">Try again</button>
        </div>
      ) : collections.length === 0 ? (
        <p className="text-sm text-gray-500">No published collections are available yet.</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${c.id}`} className="card-hover group block">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f5] mb-4">
              <Image src={c.coverImage} alt={c.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw"/>
            </div>
            <p className="text-[12px] font-medium text-accent-600 uppercase tracking-wider mb-2">Artistically Editorial</p>
            <h3 className="font-heading text-[17px] font-medium text-[#111] leading-snug">{c.name}</h3>
            <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{c.description}</p>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
