import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";
import { BROWSE_PRODUCT_WHERE } from "@/lib/product-visibility";

const staticRoutes = [
  "/",
  "/about",
  "/artists",
  "/collections",
  "/photography",
  "/contact",
  "/help",
  "/search",
  "/shipping",
  "/terms",
  "/privacy",
  "/artist-guidelines",
  "/commissions",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const route = (path: string, lastModified?: Date) => ({
    url: `${baseUrl}${path}`,
    ...(lastModified ? { lastModified } : {}),
  });

  const staticEntries = staticRoutes.map((path) => route(path));

  try {
    const [products, artists, stories] = await Promise.all([
      prisma.product.findMany({ where: BROWSE_PRODUCT_WHERE, select: { id: true, updatedAt: true } }),
      prisma.artist.findMany({ select: { id: true, updatedAt: true } }),
      prisma.story.findMany({ where: { published: true }, select: { id: true, updatedAt: true } }),
    ]);

    return [
      ...staticEntries,
      ...products.map((product) => route(`/products/${product.id}`, product.updatedAt)),
      ...artists.map((artist) => route(`/artists/${artist.id}`, artist.updatedAt)),
      ...stories.map((story) => route(`/stories/${story.id}`, story.updatedAt)),
    ];
  } catch {
    // Keep the sitemap useful during builds and dependency outages. Persisted
    // detail URLs are added whenever the database read is available.
    return staticEntries;
  }
}
