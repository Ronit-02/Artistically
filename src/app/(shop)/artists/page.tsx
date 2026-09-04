"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useArtists, useArtistFollow } from "@/hooks/useArtists";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

const FILTERS = ["All", "Verified"];

function ArtistFollowControl({ artistId }: { artistId: string | number }) {
  const router = useRouter();
  const { currentUser, isAuthPending, following, toggle } = useArtistFollow(String(artistId));

  const handleClick = () => {
    if (isAuthPending || toggle.isPending) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    toggle.mutate(following);
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isAuthPending || toggle.isPending}
        aria-pressed={following}
        className="min-h-11 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 hover:border-accent-300 hover:text-accent-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {toggle.isPending ? "Updating…" : following ? "Following" : "Follow artist"}
      </button>
      {toggle.isError && <span role="alert" className="text-[12px] text-red-600">Couldn’t update.</span>}
    </div>
  );
}

export default function ArtistsPage() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const { data: artists = [], isLoading, isError, refetch } = useArtists();

  const filtered = artists.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.handle.toLowerCase().includes(query.toLowerCase());
    const matchFilter = active === "Verified" ? a.verified : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Artists" }]} className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading leading-tight">
            Artists
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {artists.length} independent artists on Artistically
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <label htmlFor="artist-search" className="sr-only">Search artists</label>
          <input
            id="artist-search"
            type="text"
            placeholder="Search artists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-[13px] text-[#111] placeholder-gray-400 outline-none focus:border-accent-300 focus:ring-2 focus:ring-accent-50 transition-all bg-white"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-8">
        {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={active === f}
              onClick={() => setActive(f)}
            className={`min-h-11 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all border cursor-pointer ${
              active === f
                ? "bg-[#111] text-white border-[#111]"
                : "bg-white text-gray-500 border-gray-200 hover:border-accent-300 hover:text-accent-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-20"><p className="text-[14px] text-gray-500">Loading artists…</p></div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-gray-500 mb-4">We couldn’t load artists right now.</p>
          <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-gray-500">No artists found for &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((artist) => (
            <div key={artist.id}>
              <Link
                href={`/artists/${artist.id}`}
                className="card-hover group block bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
              {/* Cover */}
              <div className="img-hover-zoom relative h-44 bg-[#f5f5f5] overflow-hidden">
                <Image
                  src={artist.cover}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm relative flex-shrink-0 -mt-7 bg-[#f5f5f5]">
                      <Image src={artist.avatar} alt={artist.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-heading text-[15px] font-semibold text-[#111]">{artist.name}</h3>
                        {artist.verified && (
                          <svg className="w-3.5 h-3.5 text-accent-600 flex-shrink-0" role="img" aria-label="Verified artist" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-500">{artist.handle}</p>
                    </div>
                  </div>
                </div>

                {artist.bio && (
                  <p className="text-[12px] text-gray-500 leading-relaxed mt-3 line-clamp-2">{artist.bio}</p>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{artist.followers}</p>
                    <p className="text-[12px] text-gray-500">Followers</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{artist.designs}</p>
                    <p className="text-[12px] text-gray-500">Artworks</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{artist.verified ? "Verified" : "Unverified"}</p>
                    <p className="text-[12px] text-gray-500">Identity status</p>
                  </div>
                </div>
              </div>
              </Link>
              {artist.verified && <Link href="/help#artist-verification" className="inline-block mt-2 text-xs text-gray-500 underline underline-offset-2 hover:text-accent-600">What verified means</Link>}
              <ArtistFollowControl artistId={artist.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
