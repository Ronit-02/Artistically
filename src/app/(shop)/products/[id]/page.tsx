import { Suspense } from "react";
import ProductPageClient from "./ProductPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
      <ProductPageClient productId={Number(id)} />
    </Suspense>
  );
}
