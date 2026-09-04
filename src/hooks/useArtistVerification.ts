import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  decideAdminVerification,
  fetchArtistVerification,
  listAdminVerifications,
  submitArtistVerification,
  type VerificationStatus,
} from "@/lib/api/verification";

export const verificationKeys = {
  detail: (artistId: string) => ["artist-verification", artistId] as const,
  admin: (status?: VerificationStatus) => ["admin-verifications", status ?? "all"] as const,
};

export function useArtistVerification(artistId?: string) {
  return useQuery({
    queryKey: verificationKeys.detail(artistId ?? ""),
    queryFn: () => fetchArtistVerification(artistId!),
    enabled: !!artistId,
  });
}

export function useSubmitArtistVerification(artistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitArtistVerification.bind(null, artistId),
    onSuccess: (verification) => {
      queryClient.setQueryData(verificationKeys.detail(artistId), verification);
    },
  });
}

export function useAdminVerifications(status?: Exclude<VerificationStatus, "NOT_SUBMITTED">) {
  return useQuery({
    queryKey: verificationKeys.admin(status),
    queryFn: () => listAdminVerifications(status),
  });
}

export function useDecideAdminVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, decisionNote }: { id: string; status: Exclude<VerificationStatus, "NOT_SUBMITTED" | "SUBMITTED">; decisionNote: string }) => decideAdminVerification(id, { status, decisionNote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-verifications"] }),
  });
}
