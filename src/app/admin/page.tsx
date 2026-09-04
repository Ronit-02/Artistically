"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import {
  decideAdminAppeal,
  listAdminAppeals,
  listAdminDisputes,
  listAdminReports,
  resolveAdminDispute,
  resolveAdminReport,
  listAdminReviews,
  moderateAdminReview,
  listAdminCertificates,
  updateAdminCertificate,
  type AppealStatus,
  type DisputeStatus,
  type ModerationStatus,
  type ReviewModerationStatus,
  type CertificateStatus,
} from "@/lib/api/admin";
import type { AdminAppealDto, AdminCertificateDto, AdminDisputeDto, AdminReportDto, AdminReviewDto } from "@/types/api";
import AdminVerificationQueue from "@/components/admin/AdminVerificationQueue";

type Queue = "reports" | "appeals" | "disputes" | "reviews" | "certificates";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function targetLabel(report: AdminReportDto) {
  return report.product?.title ?? report.collection?.name ?? "Unavailable target";
}

function reportAction(report: AdminReportDto) {
  if (report.product) return "REMOVE_PRODUCT" as const;
  if (report.collection) return "UNPUBLISH_COLLECTION" as const;
  return undefined;
}

export default function AdminPage() {
  const [queue, setQueue] = useState<Queue>("reports");
  const [reportStatus, setReportStatus] = useState<ModerationStatus>("OPEN");
  const [appealStatus, setAppealStatus] = useState<AppealStatus>("OPEN");
  const [disputeStatus, setDisputeStatus] = useState<DisputeStatus>("OPEN");
  const [reports, setReports] = useState<AdminReportDto[]>([]);
  const [appeals, setAppeals] = useState<AdminAppealDto[]>([]);
  const [disputes, setDisputes] = useState<AdminDisputeDto[]>([]);
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);
  const [certificates, setCertificates] = useState<AdminCertificateDto[]>([]);
  const [reviewStatus, setReviewStatus] = useState<ReviewModerationStatus>("PUBLISHED");
  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (queue === "reports") {
        setReports(await listAdminReports(reportStatus));
      } else if (queue === "appeals") {
        setAppeals(await listAdminAppeals(appealStatus));
      } else if (queue === "disputes") {
        setDisputes(await listAdminDisputes(disputeStatus));
      } else if (queue === "reviews") {
        setReviews(await listAdminReviews(reviewStatus));
      } else {
        setCertificates(await listAdminCertificates(certificateStatus));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "We couldn’t load the moderation queue.");
    } finally {
      setIsLoading(false);
    }
  }, [appealStatus, certificateStatus, disputeStatus, queue, reportStatus, reviewStatus]);

  useEffect(() => {
    // The queue is remote state; this effect starts the initial request when
    // its selected queue or status filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQueue();
  }, [loadQueue]);

  const runDecision = async (id: string, operation: () => Promise<unknown>) => {
    setPendingId(id);
    setError(null);
    try {
      await operation();
      await loadQueue();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "We couldn’t save that decision.");
    } finally {
      setPendingId(null);
    }
  };

  const dismissReport = (report: AdminReportDto) => {
    const note = window.prompt("Optional dismissal note", "") ?? "";
    void runDecision(report.id, () => resolveAdminReport(report.id, {
      status: "DISMISSED",
      resolutionNote: note.trim() || undefined,
    }));
  };

  const resolveReport = (report: AdminReportDto) => {
    const action = reportAction(report);
    if (!action) return;
    const confirmed = window.confirm(`Remove or unpublish “${targetLabel(report)}” from public discovery?`);
    if (!confirmed) return;
    const note = window.prompt("Resolution note", "") ?? "";
    void runDecision(report.id, () => resolveAdminReport(report.id, {
      status: "RESOLVED",
      action,
      resolutionNote: note.trim() || undefined,
    }));
  };

  const decideAppeal = (appeal: AdminAppealDto, status: "APPROVED" | "REJECTED") => {
    const target = appeal.report.product?.title ?? appeal.report.collection?.name ?? "this target";
    const confirmed = window.confirm(`${status === "APPROVED" ? "Restore" : "Reject the appeal for"} “${target}”?`);
    if (!confirmed) return;
    const note = window.prompt("Decision note", "") ?? "";
    void runDecision(appeal.id, () => decideAdminAppeal(appeal.id, {
      status,
      decisionNote: note.trim() || undefined,
    }));
  };

  const decideDispute = (dispute: AdminDisputeDto | string, status: "UNDER_REVIEW" | "RESOLVED" | "REJECTED") => {
    const note = window.prompt("Resolution note", "") ?? "";
    const disputeId = typeof dispute === "string" ? dispute : dispute.id;
    void runDecision(disputeId, () => resolveAdminDispute(disputeId, { status, resolutionNote: note.trim() || undefined }));
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 lg:px-10">
          <Logo />
          <span className="text-sm font-medium text-gray-500">Administration · Moderation</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-6 py-10 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Operations</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight-heading">Moderation queue</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Review reported artwork and collections, then record an auditable decision.</p>
          </div>
          <Button variant="secondary" onClick={() => void loadQueue()} loading={isLoading}>Refresh queue</Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-gray-200">
          {(["reports", "appeals", "disputes", "reviews", "certificates"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={queue === item} onClick={() => setQueue(item)} className={`min-h-11 border-b-2 px-1 text-sm font-medium capitalize transition-colors ${queue === item ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
              {item}
            </button>
          ))}
          <label className="ml-auto mb-2 flex items-center gap-2 text-sm text-gray-600">
            <span className="sr-only">Filter {queue}</span>
            {queue === "reports" ? (
              <select aria-label="Filter reports" value={reportStatus} onChange={(event) => setReportStatus(event.target.value as ModerationStatus)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="OPEN">Open</option><option value="DISMISSED">Dismissed</option><option value="RESOLVED">Resolved</option>
              </select>
            ) : queue === "appeals" ? (
              <select aria-label="Filter appeals" value={appealStatus} onChange={(event) => setAppealStatus(event.target.value as AppealStatus)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="OPEN">Open</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
              </select>
            ) : queue === "disputes" ? (
              <select aria-label="Filter disputes" value={disputeStatus} onChange={(event) => setDisputeStatus(event.target.value as DisputeStatus)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="OPEN">Open</option><option value="UNDER_REVIEW">Under review</option><option value="RESOLVED">Resolved</option><option value="REJECTED">Rejected</option>
              </select>
            ) : queue === "reviews" ? (
              <select aria-label="Filter reviews" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as ReviewModerationStatus)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="PUBLISHED">Published</option><option value="HIDDEN">Hidden</option><option value="REMOVED">Removed</option></select>
            ) : (
              <select aria-label="Filter certificates" value={certificateStatus ?? "ALL"} onChange={(event) => setCertificateStatus(event.target.value === "ALL" ? undefined : event.target.value as CertificateStatus)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm"><option value="ALL">All</option><option value="PENDING">Pending</option><option value="VERIFIED">Verified</option><option value="REVOKED">Revoked</option></select>
            )}
          </label>
        </div>

        {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><Button variant="secondary" size="sm" onClick={() => void loadQueue()}>Try again</Button></div>}
        {isLoading ? <p className="py-16 text-center text-sm text-gray-500">Loading moderation records…</p> : queue === "reports" ? (
          reports.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center"><p className="text-sm text-gray-600">No {reportStatus.toLowerCase()} reports.</p></div> : <div className="space-y-4">{reports.map((report) => <article key={report.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{report.reason}</span><span className="text-xs text-gray-500">Reported {formatDate(report.createdAt)}</span></div><h2 className="mt-3 text-base font-semibold">{targetLabel(report)}</h2><p className="mt-1 text-sm text-gray-500">By {report.reporter.firstName} {report.reporter.lastName} · {report.reporter.email}</p></div><span className="text-xs font-medium text-gray-500">{report.status}</span></div>{report.details && <p className="mt-4 rounded-lg bg-gray-50 px-3 py-3 text-sm leading-6 text-gray-600">{report.details}</p>}{report.status === "OPEN" && <div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" size="sm" onClick={() => dismissReport(report)} disabled={pendingId === report.id}>Dismiss report</Button><Button size="sm" onClick={() => resolveReport(report)} loading={pendingId === report.id}>Resolve and remove</Button></div>}</article>)}</div>
        ) : queue === "appeals" ? appeals.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center"><p className="text-sm text-gray-600">No {appealStatus.toLowerCase()} appeals.</p></div> : <div className="space-y-4">{appeals.map((appeal) => <article key={appeal.id} className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-base font-semibold">{appeal.report.product?.title ?? appeal.report.collection?.name ?? "Unavailable target"}</h2><p className="mt-3 text-sm text-gray-600">{appeal.statement}</p>{appeal.status === "OPEN" && <div className="mt-4 flex gap-3"><Button variant="secondary" size="sm" onClick={() => decideAppeal(appeal, "REJECTED")} disabled={pendingId === appeal.id}>Reject appeal</Button><Button size="sm" onClick={() => decideAppeal(appeal, "APPROVED")} loading={pendingId === appeal.id}>Approve and restore</Button></div>}</article>)}</div> : queue === "disputes" ? disputes.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center"><p className="text-sm text-gray-600">No {disputeStatus.toLowerCase().replaceAll("_", " ")} disputes.</p></div> : <div className="space-y-4">{disputes.map((dispute) => <article key={dispute.id} className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-base font-semibold">Order {dispute.order.id}</h2><p className="mt-3 text-sm text-gray-600">{dispute.reason}</p>{dispute.status !== "RESOLVED" && dispute.status !== "REJECTED" && <div className="mt-4 flex gap-3"><Button variant="secondary" size="sm" onClick={() => decideDispute(dispute, "UNDER_REVIEW")} disabled={pendingId === dispute.id}>Mark under review</Button><Button size="sm" onClick={() => decideDispute(dispute.id, "RESOLVED")} loading={pendingId === dispute.id}>Resolve</Button></div>}</article>)}</div> : queue === "reviews" ? <div className="space-y-4">{reviews.map((review) => <article key={review.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">{review.product.title}</h2><p className="text-xs text-gray-500">{review.user.firstName} {review.user.lastName} · {formatDate(review.createdAt)}</p></div><span className="text-xs text-gray-500">{review.moderationStatus}</span></div><p className="mt-3 text-sm text-gray-600">{review.text}</p>{review.moderationStatus !== "REMOVED" && <div className="mt-4 flex gap-3"><Button variant="secondary" size="sm" onClick={() => void runDecision(review.id, () => moderateAdminReview(review.id, { status: "HIDDEN" }))}>Hide review</Button><Button size="sm" onClick={() => void runDecision(review.id, () => moderateAdminReview(review.id, { status: "REMOVED" }))}>Remove review</Button></div>}</article>)}</div> : <div className="space-y-4">{certificates.map((certificate) => <article key={certificate.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">{certificate.product.title}</h2><p className="text-xs text-gray-500">{certificate.certificateNumber} · {certificate.artist.handle}</p></div><span className="text-xs text-gray-500">{certificate.status}</span></div><p className="mt-3 text-sm text-gray-600">{certificate.note ?? "No certificate note provided."}</p>{certificate.status === "PENDING" && <div className="mt-4 flex gap-3"><Button variant="secondary" size="sm" onClick={() => void runDecision(certificate.id, () => updateAdminCertificate(certificate.id, { status: "REVOKED" }))}>Revoke</Button><Button size="sm" onClick={() => void runDecision(certificate.id, () => updateAdminCertificate(certificate.id, { status: "VERIFIED" }))}>Verify certificate</Button></div>}</article>)}</div>}
        <AdminVerificationQueue />
      </main>
    </div>
  );
}
