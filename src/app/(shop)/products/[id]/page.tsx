import { Suspense } from "react";
import type { Metadata } from "next";
import { metadataService } from "@/lib/services/metadata.service";
import { createProductJsonLd, createProductMetadata, serializeJsonLd } from "@/lib/seo-metadata";
import ProductPageClient from "./ProductPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await metadataService.getProduct((await params).id);
    return product ? createProductMetadata(product) : {};
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  let productJsonLd: string | null = null;
  try {
    const product = await metadataService.getProduct(id);
    if (product) productJsonLd = serializeJsonLd(createProductJsonLd(product));
  } catch {
    // Structured data is supplemental; page rendering remains available if the read fails.
  }

  return (
    <>
      {productJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd }} />
      ) : null}
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
        <ProductPageClient productId={id} />
      </Suspense>
    </>
  );
}
