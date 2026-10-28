"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { catalogImageCandidates } from "@/lib/catalog-images";

function ResolvedCatalogImage({ src, alt, onError, ...props }: ImageProps) {
  const [attempt, setAttempt] = useState(0);
  const candidates = typeof src === "string" ? catalogImageCandidates(src) : [src];
  return (
    <Image
      {...props}
      src={candidates[attempt]}
      alt={alt}
      onError={(event) => {
        if (attempt < candidates.length - 1) {
          setAttempt(attempt + 1);
        }
        onError?.(event);
      }}
    />
  );
}

export default function CatalogImage(props: ImageProps) {
  // A different source starts a fresh fallback sequence, including carousel changes.
  return <ResolvedCatalogImage key={typeof props.src === "string" ? props.src : undefined} {...props} />;
}
