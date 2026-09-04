import { useQuery } from "@tanstack/react-query";
import { archiveArtistCollection, createArtistCollection, fetchArtistCollections, fetchCollectionById, fetchCollections, updateArtistCollection, type ArtistCollectionInput } from "@/lib/api/collections";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const collectionKeys = {
  all: ["collections"] as const,
  detail: (id: string) => ["collections", id] as const,
};

export function useCollections() {
  return useQuery({ queryKey: collectionKeys.all, queryFn: fetchCollections });
}

export function useCollection(id: string) {
  return useQuery({ queryKey: collectionKeys.detail(id), queryFn: () => fetchCollectionById(id), enabled: !!id });
}

export function useArtistCollections(enabled = true) {
  return useQuery({ queryKey: ["artist-collections"], queryFn: fetchArtistCollections, enabled });
}

export function useArtistCollectionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["artist-collections"] });
  return {
    create: useMutation({ mutationFn: (input: ArtistCollectionInput) => createArtistCollection(input), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<ArtistCollectionInput> }) => updateArtistCollection(id, input), onSuccess: invalidate }),
    archive: useMutation({ mutationFn: archiveArtistCollection, onSuccess: invalidate }),
  };
}
