"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useArtist, useArtistProducts, useArtistFollow } from "@/hooks/useArtists";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ArtistPageClient({ artistId }: { artistId: string }) {
  const router = useRouter();
  const { data: artist, isLoading, isError, refetch } = useArtist(artistId);
  const {
    data: artistProducts = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useArtistProducts(artistId);
  const { currentUser, isAuthPending, following, toggle } = useArtistFollow(artistId);

  if (isLoading) return <div className="min-h-screen animate-pulse bg-gray-50" />;
  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">We couldn’t load this artist right now.</p>
        <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  if (!artist) return <div className="text-center py-20 text-gray-500">Artist not found.</div>;

  const isOwnProfile = currentUser?.artist?.id === artist.id;

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
                <Link href="/help#artist-verification" className="inline-flex items-center gap-1 text-gray-500 hover:text-accent-600" aria-label="What Verified artist means">
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg><span className="text-xs underline underline-offset-2">Verified</span></Link>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{artist.handle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span><strong className="text-[#111]">{artist.followers}</strong> followers</span>
              <span><strong className="text-[#111]">{artist.designs}</strong> designs</span>
            </div>
          </div>
          <Button
            variant="primary"
            disabled={isAuthPending || toggle.isPending || isOwnProfile}
            onClick={() => {
              if (!currentUser) {
                router.push("/login");
                return;
              }
              toggle.mutate(following);
            }}
          >
            {isOwnProfile ? "Your profile" : toggle.isPending ? "Updating…" : following ? "Following" : "Follow Artist"}
          </Button>
        </div>
        {artist.bio && <p className="text-sm text-gray-500 mt-4 leading-relaxed">{artist.bio}</p>}
        {toggle.isError && <p role="alert" className="text-sm text-red-600 mt-4">Couldn’t update your follow status. Try again.</p>}
      </div>

      {/* Products */}
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-gray-900 mb-5 tracking-tight-heading">Artworks by {artist.name}</h2>
      {productsLoading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading artworks…</p>
      ) : productsError ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500 mb-4">We couldn’t load this artist’s artworks.</p>
          <Button variant="secondary" onClick={() => refetchProducts()}>Try Again</Button>
        </div>
      ) : artistProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">This artist has no published artworks yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artistProducts.map((p) => <ProductCard key={p.id} product={p}/>) }
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">Artist reviews</h2>
        <p className="text-sm text-gray-500 italic">Artist-level reviews will appear when verified-purchase review data is available.</p>
      </div>
    </div>
  );
}
