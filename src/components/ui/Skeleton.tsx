import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-[#f4f4f1] ${className}`} {...props} />;
}
