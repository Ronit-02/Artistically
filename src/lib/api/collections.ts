import type { Collection } from "@/types";
import type { ArtistCollectionDto, CollectionDetailDto, CollectionDto } from "@/types/api";
import { ApiClientError, apiRequest } from "@/lib/api/client";
import { mapProduct } from "@/lib/api/products";

function mapCollection(collection: CollectionDto): Collection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    coverImage: collection.coverImage,
    artworkCount: collection.artworkCount,
    featured: collection.featured,
  };
}

export async function fetchCollections(): Promise<Collection[]> {
  const collections = await apiRequest<CollectionDto[]>("/api/collections");
  return collections.map(mapCollection);
}

export async function fetchCollectionById(id: string) {
  try {
    const collection = await apiRequest<CollectionDetailDto>(`/api/collections/${encodeURIComponent(id)}`);
    return { ...mapCollection(collection), products: collection.products.map(mapProduct) };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export type ArtistCollectionInput = {
  name: string;
  description: string;
  coverImage: string;
  productIds: string[];
};

export async function fetchArtistCollections() {
  return apiRequest<ArtistCollectionDto[]>("/api/artist/collections");
}

export async function createArtistCollection(input: ArtistCollectionInput) {
  return apiRequest<ArtistCollectionDto>("/api/artist/collections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateArtistCollection(id: string, input: Partial<ArtistCollectionInput>) {
  return apiRequest<ArtistCollectionDto>(`/api/artist/collections/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function archiveArtistCollection(id: string) {
  await apiRequest<never>(`/api/artist/collections/${encodeURIComponent(id)}`, { method: "DELETE" });
}
