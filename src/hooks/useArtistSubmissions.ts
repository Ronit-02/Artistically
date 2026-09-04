import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizeMediaUpload, fetchArtistSubmissions, submitArtistListing, uploadMediaFile, type ListingSubmissionInput } from "@/lib/api/media";
import type { MediaPurposeInput } from "@/lib/api/media";

export function useArtistSubmissions(enabled = true) {
  return useQuery({ queryKey: ["artist-submissions"], queryFn: fetchArtistSubmissions, enabled });
}

export function useArtistSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: submitArtistListing, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artist-submissions"] }) });
}

export function useMediaUpload() {
  return useMutation({
    mutationFn: async ({ file, purpose }: { file: File; purpose: MediaPurposeInput }) => {
      const operation = await authorizeMediaUpload({ purpose, fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size });
      return uploadMediaFile(file, operation);
    },
  });
}

export type { ListingSubmissionInput };
