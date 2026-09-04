import { Suspense } from "react";
import type { Metadata } from "next";
import { metadataService } from "@/lib/services/metadata.service";
import { createArtistJsonLd, createArtistMetadata, serializeJsonLd } from "@/lib/seo-metadata";
import ArtistPageClient from "./ArtistPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const artist = await metadataService.getArtist((await params).id);
    return artist ? createArtistMetadata(artist) : {};
  } catch {
    return {};
  }
}

export default async function ArtistPage({ params }: Props) {
  const { id } = await params;
  let artistJsonLd: string | null = null;
  try {
    const artist = await metadataService.getArtist(id);
    if (artist) artistJsonLd = serializeJsonLd(createArtistJsonLd(artist));
  } catch {
    // Structured data is supplemental; page rendering remains available if the read fails.
  }

  return (
    <>
      {artistJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: artistJsonLd }} />
      ) : null}
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
        <ArtistPageClient artistId={id} />
      </Suspense>
    </>
  );
}
