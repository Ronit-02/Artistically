import type { Metadata } from "next";
import { metadataService } from "@/lib/services/metadata.service";
import { createCollectionJsonLd, createCollectionMetadata, serializeJsonLd } from "@/lib/seo-metadata";
import CollectionDetailClient from "./CollectionDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const collection = await metadataService.getCollection((await params).id);
    return collection ? createCollectionMetadata(collection) : {};
  } catch {
    return {};
  }
}

export default async function CollectionPage({ params }: Props) {
  const { id } = await params;
  let collectionJsonLd: string | null = null;
  try {
    const collection = await metadataService.getCollection(id);
    if (collection) collectionJsonLd = serializeJsonLd(createCollectionJsonLd(collection));
  } catch {
    // Structured data is supplemental; page rendering remains available if the read fails.
  }

  return (
    <>
      {collectionJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionJsonLd }} /> : null}
      <CollectionDetailClient collectionId={id} />
    </>
  );
}
