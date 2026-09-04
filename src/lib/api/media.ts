import { apiRequest } from "@/lib/api/client";

export type MediaPurposeInput = "ARTWORK_IMAGE" | "DIGITAL_FILE" | "ARTIST_COVER" | "VERIFICATION_EVIDENCE";
export type SignedMediaUpload = { asset: { id: string; purpose: MediaPurposeInput; status: string; visibility: string; mimeType: string; sizeBytes: number }; upload: { provider: string; uploadUrl: string; headers: Record<string, string>; expiresAt: string } };

export async function authorizeMediaUpload(input: { purpose: MediaPurposeInput; fileName: string; mimeType: string; sizeBytes: number }) {
  return apiRequest<SignedMediaUpload>("/api/artist/media", { method: "POST", body: JSON.stringify(input) });
}

export async function uploadMediaFile(file: File, operation: SignedMediaUpload) {
  const response = await fetch(operation.upload.uploadUrl, { method: "PUT", headers: operation.upload.headers, body: file });
  if (!response.ok) throw new Error("The media provider rejected the upload.");
  return apiRequest<{ id: string; purpose: string; status: string; mimeType: string; sizeBytes: number }>(`/api/artist/media/${encodeURIComponent(operation.asset.id)}/complete`, { method: "POST", body: JSON.stringify({}) });
}

export type ListingSubmissionInput = {
  title: string; description?: string; price: number; originalPrice?: number; discount?: number; category: string; badge?: string; stock?: number; processingDays?: number;
  artworkDetails: Record<string, unknown>; imageAssetIds: string[]; digitalAssetId?: string;
};

export async function submitArtistListing(input: ListingSubmissionInput) {
  return apiRequest<{ id: string; title: string; isActive: boolean; status: "SUBMITTED" }>("/api/artist/submissions", { method: "POST", body: JSON.stringify(input) });
}

export type ListingSubmissionDto = { id: string; productId: string; status: string; submittedAt: string; reviewedAt: string | null; reviewNote: string | null; product: { title: string; isActive: boolean } };

export function fetchArtistSubmissions() {
  return apiRequest<ListingSubmissionDto[]>("/api/artist/submissions");
}
