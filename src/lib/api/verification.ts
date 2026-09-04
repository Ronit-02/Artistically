import { apiRequest } from "@/lib/api/client";
import type { AdminVerificationDto, ArtistVerificationDto } from "@/types/api";

export type VerificationStatus = ArtistVerificationDto["status"];

export function fetchArtistVerification(artistId: string) {
  return apiRequest<ArtistVerificationDto | null>(`/api/artists/${encodeURIComponent(artistId)}/verification`);
}

export function submitArtistVerification(artistId: string, input: {
  identityReference: string;
  backgroundStatement: string;
  portfolioReference?: string;
}) {
  return apiRequest<ArtistVerificationDto>(`/api/artists/${encodeURIComponent(artistId)}/verification`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAdminVerifications(status?: Exclude<VerificationStatus, "NOT_SUBMITTED">) {
  const query = status ? `?status=${status}` : "";
  return apiRequest<AdminVerificationDto[]>(`/api/admin/verifications${query}`);
}

export function decideAdminVerification(id: string, input: {
  status: Exclude<VerificationStatus, "NOT_SUBMITTED" | "SUBMITTED">;
  decisionNote: string;
}) {
  return apiRequest<AdminVerificationDto>(`/api/admin/verifications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
