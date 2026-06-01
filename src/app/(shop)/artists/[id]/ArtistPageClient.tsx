"use client";

import Image from "next/image";
import Link from "next/link";
import { useArtist, useArtistProducts } from "@/hooks/useArtists";
import ProductCard from "@/components/product/ProductCard";
import RatingStars from "@/components/ui/RatingStars";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ArtistPageClient({ artistId }: { artistId: number }) {
  const { data: artist, isLoading } = useArtist(artistId);
  const { data: artistProducts } = useArtistProducts(artist?.name ?? "");

  if (isLoading) return <div className="min-h-screen animate-pulse bg-gray-50" />;
  if (!artist) return <div className="text-center py-20 text-gray-500">Artist not found.</div>;

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pb-12">
      <Breadcrumb items={[{ label: "Artists" }, { label: artist.name }]} className="py-4" />

      {/* Cover */}
      <div className="relative h-48 sm:h-64 bg-gray-200 -mx-4 sm:-mx-6 overflow-hidden">
        <Image src={artist.cover} alt={artist.name} fill className="object-cover" sizes="100vw" priority/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
      </div>

      {/* Profile card */}
      <div className="relative bg-white rounded-xl border border-gray-100 shadow-md mx-2 sm:mx-4 -mt-8 px-5 sm:px-8 pt-5 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow relative -mt-10 sm:-mt-12 flex-shrink-0">
            <Image src={artist.avatar} alt={artist.name} fill className="object-cover" sizes="80px"/>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight-heading">{artist.name}</h1>
              {artist.verified && (
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{artist.handle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span><strong className="text-[#111]">{artist.followers}</strong> followers</span>
              <span><strong className="text-[#111]">{artist.designs}</strong> designs</span>
            </div>
          </div>
          <Button variant="primary">Follow Artist</Button>
        </div>
        {artist.bio && <p className="text-sm text-gray-500 mt-4 leading-relaxed">{artist.bio}</p>}
      </div>

      {/* Products */}
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-gray-900 mb-5 tracking-tight-heading">Artworks by {artist.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(artistProducts ?? []).map((p) => <ProductCard key={p.id} product={p}/>)}
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">Artist Reviews</h2>
        <RatingStars rating={4.7} reviews={128} size="md"/>
        <p className="text-sm text-gray-400 italic mt-3">Reviews for this artist coming soon.</p>
      </div>
    </div>
  );
}
