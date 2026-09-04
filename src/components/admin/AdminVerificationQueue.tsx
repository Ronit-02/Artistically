"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAdminVerifications, useDecideAdminVerification } from "@/hooks/useArtistVerification";
import type { VerificationStatus } from "@/lib/api/verification";

const STATUS_OPTIONS: Array<Exclude<VerificationStatus, "NOT_SUBMITTED"> | "ALL"> = ["ALL", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "REVOKED"];

export default function AdminVerificationQueue() {
  const [status, setStatus] = useState<Exclude<VerificationStatus, "NOT_SUBMITTED"> | undefined>("SUBMITTED");
  const { data: verifications = [], isLoading, isError, refetch } = useAdminVerifications(status);
  const decision = useDecideAdminVerification();

  const decide = (id: string, nextStatus: Exclude<VerificationStatus, "NOT_SUBMITTED" | "SUBMITTED">, label: string) => {
    if (!window.confirm(`${label} this artist verification case?`)) return;
    const decisionNote = window.prompt("Decision note (required)", "")?.trim() ?? "";
    if (!decisionNote) return;
    decision.mutate({ id, status: nextStatus, decisionNote });
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-10" aria-labelledby="verification-queue-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div><h2 id="verification-queue-heading" className="font-heading text-xl font-semibold text-gray-900">Artist verification</h2><p className="mt-1 text-sm text-gray-500">Review private evidence references and record a durable identity decision.</p></div>
        <label className="text-sm text-gray-600"><span className="sr-only">Filter verification cases</span><select aria-label="Filter verification cases" value={status ?? "ALL"} onChange={(event) => setStatus(event.target.value === "ALL" ? undefined : event.target.value as Exclude<VerificationStatus, "NOT_SUBMITTED">)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3"><option value="ALL">All statuses</option>{STATUS_OPTIONS.slice(1).map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>
      </div>
      {isLoading ? <p className="py-8 text-sm text-gray-500">Loading verification cases…</p> : isError ? <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500"><span>Verification cases could not be loaded.</span><Button variant="secondary" size="sm" onClick={() => void refetch()}>Try again</Button></div> : verifications.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500">No verification cases match this filter.</div> : <div className="space-y-4">{verifications.map((verification) => <article key={verification.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-gray-900">{verification.artist.user.firstName} {verification.artist.user.lastName} <span className="font-normal text-gray-500">{verification.artist.handle}</span></h3><p className="mt-1 text-xs text-gray-500">{verification.artist.user.email} · {verification.status}</p></div><span className="text-xs text-gray-500">{verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString("en-IN") : "Not submitted"}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{verification.evidence.map((evidence) => <div key={evidence.id} className="rounded-lg bg-gray-50 px-3 py-3"><p className="text-xs font-medium text-gray-700">{evidence.type}</p><p className="mt-1 break-all text-xs text-gray-500">{evidence.reference}</p>{evidence.note && <p className="mt-2 text-sm leading-5 text-gray-600">{evidence.note}</p>}</div>)}</div>{verification.decisionNote && <p className="mt-4 text-sm text-gray-600">Previous note: {verification.decisionNote}</p>}{["SUBMITTED", "UNDER_REVIEW"].includes(verification.status) && <div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" size="sm" onClick={() => decide(verification.id, "REJECTED", "Reject")} disabled={decision.isPending}>Reject</Button><Button size="sm" onClick={() => decide(verification.id, "VERIFIED", "Approve") } loading={decision.isPending}>Approve verification</Button></div>}{verification.status === "VERIFIED" && <div className="mt-5"><Button variant="secondary" size="sm" onClick={() => decide(verification.id, "REVOKED", "Revoke")} loading={decision.isPending}>Revoke verification</Button></div>}</article>)}</div>}
    </section>
  );
}
