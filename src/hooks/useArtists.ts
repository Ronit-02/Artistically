import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArtists, fetchArtistById, fetchArtistProducts, fetchArtistFollow, followArtist, unfollowArtist, updateArtistProfile } from "@/lib/api/artists";
import type { UpdateArtistProfileInput } from "@/lib/api/artists";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const artistKeys = {
  all: ["artists"] as const,
  detail: (id: string) => ["artists", id] as const,
  products: (id: string) => ["artists", id, "products"] as const,
  follow: (artistId: string, userId?: string) => ["artists", artistId, "follow", userId ?? null] as const,
};

export function useArtists() {
  return useQuery({
    queryKey: artistKeys.all,
    queryFn: fetchArtists,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: artistKeys.detail(id),
    queryFn: () => fetchArtistById(id),
    enabled: !!id,
  });
}

export function useArtistProducts(artistId: string) {
  return useQuery({
    queryKey: artistKeys.products(artistId),
    queryFn: () => fetchArtistProducts(artistId),
    enabled: !!artistId,
  });
}

export function useArtistFollow(artistId: string) {
  const queryClient = useQueryClient();
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const followQuery = useQuery({
    queryKey: artistKeys.follow(artistId, currentUser?.id),
    queryFn: () => fetchArtistFollow(artistId),
    enabled: !!artistId && !!currentUser,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (following: boolean) => following ? unfollowArtist(artistId) : followArtist(artistId),
    onSuccess: (next) => {
      queryClient.setQueryData(artistKeys.follow(artistId, currentUser?.id), next);
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) });
    },
  });

  return {
    ...followQuery,
    currentUser,
    isAuthPending,
    following: followQuery.data?.following ?? false,
    toggle: mutation,
  };
}

export function useUpdateArtistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artistId, input }: { artistId: string; input: UpdateArtistProfileInput }) =>
      updateArtistProfile(artistId, input),
    onSuccess: (artist) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artist.id) });
    },
  });
}
