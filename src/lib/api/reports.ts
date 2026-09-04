import { apiRequest } from "@/lib/api/client";
import type { ReportDto } from "@/types/api";

export type ReportTargetType = "PRODUCT" | "COLLECTION";
export type ReportReason = "INACCURATE" | "COPYRIGHT" | "PROHIBITED" | "HARASSMENT" | "OTHER";

export function createReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}) {
  return apiRequest<ReportDto>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
