import type { Artist } from "@/types";
import { artists, allProducts } from "@/data";
import type { Product } from "@/types";

export async function fetchArtists(): Promise<Artist[]> {
  return artists;
}

export async function fetchArtistById(id: number): Promise<Artist | null> {
  return artists.find((a) => a.id === id) ?? null;
}

export async function fetchArtistProducts(artistName: string): Promise<Product[]> {
  const matched = allProducts.filter(
    (p) => p.artistName.toLowerCase() === artistName.toLowerCase()
  );
  return matched.length > 0 ? matched : allProducts.slice(0, 6);
}
