import { useQuery } from "@tanstack/react-query";
import { fetchArtists, fetchArtistById, fetchArtistProducts } from "@/lib/api/artists";

export const artistKeys = {
  all: ["artists"] as const,
  detail: (id: number) => ["artists", id] as const,
  products: (name: string) => ["artists", name, "products"] as const,
};

export function useArtists() {
  return useQuery({
    queryKey: artistKeys.all,
    queryFn: fetchArtists,
  });
}

export function useArtist(id: number) {
  return useQuery({
    queryKey: artistKeys.detail(id),
    queryFn: () => fetchArtistById(id),
    enabled: !!id,
  });
}

export function useArtistProducts(artistName: string) {
  return useQuery({
    queryKey: artistKeys.products(artistName),
    queryFn: () => fetchArtistProducts(artistName),
    enabled: !!artistName,
  });
}
