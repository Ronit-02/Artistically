import manifest from "@/data/catalog-image-manifest.json";
import { IMAGE_PLACEHOLDER } from "@/lib/image-placeholder";

export interface CatalogImageEntry {
  productId: string;
  originalUrl: string;
  url: string;
  fileId: string;
  filePath: string;
  checksum: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const images: readonly CatalogImageEntry[] = manifest.images.map((image: CatalogImageEntry) => ({
  ...image,
  // Content-hashed paths identify versions; upload-response timestamps are unnecessary.
  url: image.url.split("?")[0],
}));
const entries = new Map(images.flatMap((image) => [[image.originalUrl, image], [image.url, image]] as const));

export function catalogImageCandidates(source: string, entry = entries.get(source)): string[] {
  return [...new Set([entry?.url ?? source, entry?.originalUrl ?? source, IMAGE_PLACEHOLDER])];
}

export function catalogImageUrl(source: string): string {
  return entries.get(source)?.url ?? source;
}
