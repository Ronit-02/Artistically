"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReportMutations } from "@/hooks/useReportMutations";
import type { ReportReason, ReportTargetType } from "@/lib/api/reports";

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "INACCURATE", label: "Information appears inaccurate" },
  { value: "COPYRIGHT", label: "Copyright or ownership concern" },
  { value: "PROHIBITED", label: "Content may violate marketplace policy" },
  { value: "HARASSMENT", label: "Harassment or abusive content" },
  { value: "OTHER", label: "Other concern" },
];

export default function ReportForm({ targetType, targetId, targetLabel }: {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
}) {
  const router = useRouter();
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const reportMutation = useReportMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("INACCURATE");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reportMutation.create.mutate({
      targetType,
      targetId,
      reason,
      ...(details.trim() ? { details: details.trim() } : {}),
    }, {
      onSuccess: () => {
        setDetails("");
        setSubmitted(true);
        setIsOpen(false);
      },
    });
  };

  if (isAuthPending) return null;

  return (
    <section aria-labelledby={`${targetType.toLowerCase()}-report-heading`} className="border-t border-gray-200 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={`${targetType.toLowerCase()}-report-heading`} className="text-sm font-semibold text-gray-900">Something wrong with this {targetType === "PRODUCT" ? "artwork" : "collection"}?</h2>
          <p className="mt-1 text-xs text-gray-500">Tell Artistically so our team can review it.</p>
        </div>
        {!currentUser ? (
          <Button variant="secondary" size="sm" onClick={() => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)}>Sign in to report</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => { setSubmitted(false); setIsOpen((open) => !open); }} aria-expanded={isOpen} aria-controls={`${targetType.toLowerCase()}-report-form`}>{isOpen ? "Close report form" : "Report"}</Button>
        )}
      </div>

      {submitted && <p role="status" className="mt-3 text-sm text-green-700">Thanks. Your report about “{targetLabel}” was submitted for review.</p>}
      {reportMutation.create.isError && <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-red-600"><span>{reportMutation.create.error instanceof Error ? reportMutation.create.error.message : "We couldn’t submit the report."}</span><Button variant="ghost" size="sm" onClick={() => reportMutation.create.reset()}>Dismiss</Button></div>}

      {isOpen && currentUser && <form id={`${targetType.toLowerCase()}-report-form`} onSubmit={handleSubmit} className="mt-4 max-w-xl space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4" noValidate>
        <div>
          <label htmlFor={`${targetType.toLowerCase()}-report-reason`} className="block text-sm font-medium text-gray-700">Reason</label>
          <select id={`${targetType.toLowerCase()}-report-reason`} value={reason} onChange={(event) => setReason(event.target.value as ReportReason)} className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
            {REASONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${targetType.toLowerCase()}-report-details`} className="block text-sm font-medium text-gray-700">Details <span className="font-normal text-gray-500">(optional)</span></label>
          <textarea id={`${targetType.toLowerCase()}-report-details`} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={4} placeholder="Share the specific concern for our review." className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
          <p className="mt-1 text-xs text-gray-500">{details.length}/1000 characters</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="sm" loading={reportMutation.create.isPending}>Submit report</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </form>}
    </section>
  );
}
