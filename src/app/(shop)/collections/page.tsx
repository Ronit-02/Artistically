"use client";

import Image from "next/image";
import Link from "next/link";
import { collections } from "@/data";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CollectionsPage() {
  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <Breadcrumb items={[{ label: "Collections" }]} className="mb-6" />
      <h1 className="font-heading text-[2rem] sm:text-[2.75rem] font-bold text-[#111] tracking-tighter-heading mb-2">
        Curated Collections
      </h1>
      <p className="text-[15px] text-gray-400 mb-10 max-w-xl leading-relaxed">
        Thoughtfully curated groupings that bring together artworks united by theme, medium, or vision.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${c.id}`} className="card-hover group block">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f5] mb-4">
              <Image src={c.coverImage} alt={c.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw"/>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full overflow-hidden relative flex-shrink-0">
                <Image src={c.curatorAvatar} alt="" fill className="object-cover" sizes="20px"/>
              </div>
              <span className="text-[11px] font-medium text-accent-600 uppercase tracking-wider">{c.curatorName}</span>
            </div>
            <h3 className="font-heading text-[17px] font-medium text-[#111] leading-snug">{c.name}</h3>
            <p className="text-[13px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{c.description}</p>
            <p className="text-[12px] text-gray-300 mt-3">{c.artworkCount} artworks</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
