import { Suspense } from "react";
import ArtistPageClient from "./ArtistPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
      <ArtistPageClient artistId={Number(id)} />
    </Suspense>
  );
}
