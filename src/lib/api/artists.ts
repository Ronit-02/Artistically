import type { Artist } from "@/types";
import type { Product } from "@/types";
import { apiRequest, ApiClientError } from "@/lib/api/client";
import { fetchProducts } from "@/lib/api/products";
import type { ArtistDto } from "@/types/api";
import type { ArtistFollowDto } from "@/types/api";

export type UpdateArtistProfileInput = {
  handle?: string;
  bio?: string;
  cover?: string;
};

function mapArtist(artist: ArtistDto): Artist {
  const name = `${artist.user.firstName} ${artist.user.lastName}`.trim();
  return {
    id: artist.id,
    name,
    handle: artist.handle,
    followers: artist._count.followers.toLocaleString(),
    avatar: artist.user.avatar ?? "/artists/artist-1.jpg",
    cover: artist.cover ?? "/artists/artist-1-cover.jpg",
    designs: artist._count.products,
    bio: artist.bio ?? undefined,
    verified: artist.verified,
  };
}

export async function fetchArtists(): Promise<Artist[]> {
  const response = await apiRequest<ArtistDto[]>("/api/artists");
  return response.map(mapArtist);
}

export async function fetchArtistById(id: string): Promise<Artist | null> {
  try {
    return mapArtist(await apiRequest<ArtistDto>(`/api/artists/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchArtistProducts(artistId: string): Promise<Product[]> {
  return fetchProducts({ artistId });
}

export async function fetchArtistFollow(artistId: string): Promise<ArtistFollowDto> {
  return apiRequest<ArtistFollowDto>(`/api/artists/${encodeURIComponent(artistId)}/follow`);
}

export async function followArtist(artistId: string): Promise<ArtistFollowDto> {
  return apiRequest<ArtistFollowDto>(`/api/artists/${encodeURIComponent(artistId)}/follow`, {
    method: "POST",
  });
}

export async function unfollowArtist(artistId: string): Promise<ArtistFollowDto> {
  return apiRequest<ArtistFollowDto>(`/api/artists/${encodeURIComponent(artistId)}/follow`, {
    method: "DELETE",
  });
}

export async function updateArtistProfile(
  artistId: string,
  input: UpdateArtistProfileInput,
): Promise<ArtistDto> {
  return apiRequest<ArtistDto>(`/api/artists/${encodeURIComponent(artistId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
