"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Artist } from "@/types";

export default function ArtistCard({ artist }: { artist: Artist }) {
  const router = useRouter();

  return (
    <div onClick={() => router.push(`/artists/${artist.id}`)} className="card-hover cursor-pointer group relative">
      {/* Cover */}
      <div className="img-hover-zoom relative h-40 rounded-xl overflow-hidden bg-[#f5f5f5]">
        <Image src={artist.cover} alt={artist.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative flex-shrink-0">
            <Image src={artist.avatar} alt={artist.name} fill className="object-cover" sizes="32px" />
          </div>
          <div>
            <p className="text-[13px] font-heading font-semibold text-white flex items-center gap-1">
              {artist.name}
              {artist.verified && <svg className="w-3 h-3 text-accent-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd"/></svg>}
            </p>
            <p className="text-[10px] text-white/60">{artist.followers} followers · {artist.designs} works</p>
          </div>
        </div>
      </div>
    </div>
  );
}
