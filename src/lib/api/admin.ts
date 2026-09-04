import { apiRequest } from "@/lib/api/client";
import type { AdminAppealDto, AdminCertificateDto, AdminDisputeDto, AdminReportDto, AdminReviewDto } from "@/types/api";

export type ModerationStatus = "OPEN" | "DISMISSED" | "RESOLVED";
export type AppealStatus = "OPEN" | "APPROVED" | "REJECTED";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
export type ReviewModerationStatus = "PUBLISHED" | "HIDDEN" | "REMOVED";
export type CertificateStatus = "PENDING" | "VERIFIED" | "REVOKED";

export function listAdminReports(status: ModerationStatus = "OPEN") {
  return apiRequest<AdminReportDto[]>(`/api/admin/reports?status=${status}`);
}

export function resolveAdminReport(
  reportId: string,
  input: {
    status: Exclude<ModerationStatus, "OPEN">;
    action?: "REMOVE_PRODUCT" | "UNPUBLISH_COLLECTION";
    resolutionNote?: string;
  },
) {
  return apiRequest<AdminReportDto>(`/api/admin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listAdminAppeals(status: AppealStatus = "OPEN") {
  return apiRequest<AdminAppealDto[]>(`/api/admin/appeals?status=${status}`);
}

export function decideAdminAppeal(
  appealId: string,
  input: { status: Exclude<AppealStatus, "OPEN">; decisionNote?: string },
) {
  return apiRequest<AdminAppealDto>(`/api/admin/appeals/${appealId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listAdminDisputes(status: DisputeStatus = "OPEN") {
  return apiRequest<AdminDisputeDto[]>(`/api/admin/disputes?status=${status}`);
}

export function resolveAdminDispute(
  disputeId: string,
  input: { status: Exclude<DisputeStatus, "OPEN">; resolutionNote?: string },
) {
  return apiRequest<AdminDisputeDto>(`/api/admin/disputes/${disputeId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listAdminReviews(status: ReviewModerationStatus = "PUBLISHED") {
  return apiRequest<AdminReviewDto[]>(`/api/admin/reviews?status=${status}`);
}

export function moderateAdminReview(reviewId: string, input: { status: ReviewModerationStatus; moderationNote?: string }) {
  return apiRequest<AdminReviewDto>(`/api/admin/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function listAdminCertificates(status?: CertificateStatus) {
  return apiRequest<AdminCertificateDto[]>(`/api/admin/certificates${status ? `?status=${status}` : ""}`);
}

export function updateAdminCertificate(certificateId: string, input: { status: Exclude<CertificateStatus, "PENDING">; note?: string }) {
  return apiRequest<AdminCertificateDto>(`/api/admin/certificates/${certificateId}`, { method: "PATCH", body: JSON.stringify(input) });
}
