"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

function ImageWithLoadingState({ className = "", onLoad, onError, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={`${className}${isLoading ? " animate-pulse motion-reduce:animate-none bg-gray-200" : ""}`}
      aria-busy={isLoading || undefined}
      onLoad={(event) => {
        setIsLoading(false);
        onLoad?.(event);
      }}
      onError={(event) => {
        setIsLoading(false);
        onError?.(event);
      }}
    />
  );
}

export default function LoadingImage(props: ImageProps) {
  const source = typeof props.src === "string"
    ? props.src
    : "default" in props.src ? props.src.default.src : props.src.src;

  // Source changes, including fallback attempts, start a fresh loading state.
  return <ImageWithLoadingState key={source} {...props} />;
}
