"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useArtistVerification, useSubmitArtistVerification } from "@/hooks/useArtistVerification";
import { ApiClientError } from "@/lib/api/client";

const STATUS_COPY: Record<string, string> = {
  NOT_SUBMITTED: "No verification submission has been received.",
  SUBMITTED: "Your submission is queued for administrator review.",
  UNDER_REVIEW: "An administrator is reviewing your submission.",
  VERIFIED: "Your identity and background have been reviewed by Artistically.",
  REJECTED: "Your previous submission was not approved. You may submit updated evidence.",
  REVOKED: "Your verification was revoked. Contact support before resubmitting.",
};

export default function ArtistVerificationForm({ artistId }: { artistId: string }) {
  const { data: verification, isLoading, isError, refetch } = useArtistVerification(artistId);
  const submit = useSubmitArtistVerification(artistId);
  const [identityReference, setIdentityReference] = useState("");
  const [backgroundStatement, setBackgroundStatement] = useState("");
  const [portfolioReference, setPortfolioReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = !verification || verification.status === "REJECTED";
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    submit.mutate({
      identityReference: identityReference.trim(),
      backgroundStatement: backgroundStatement.trim(),
      ...(portfolioReference.trim() ? { portfolioReference: portfolioReference.trim() } : {}),
    }, {
      onSuccess: () => {
        setIdentityReference("");
        setBackgroundStatement("");
        setPortfolioReference("");
        setSubmitted(true);
      },
    });
  };

  return (
    <section className="mt-6 border-t border-gray-100 pt-6" aria-labelledby="artist-verification-heading">
      <div className="mb-4">
        <h3 id="artist-verification-heading" className="font-heading text-base font-semibold text-gray-900">Artist verification</h3>
        <p className="mt-1 text-sm leading-6 text-gray-500">Verification means Artistically reviewed your identity and background. It does not guarantee any artwork, price, or future action.</p>
      </div>
      {isLoading ? <p className="text-sm text-gray-500">Loading verification status…</p> : isError ? <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500"><span>Verification status could not be loaded.</span><Button variant="secondary" size="sm" onClick={() => void refetch()}>Try again</Button></div> : (
        <>
          <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600"><span className="font-medium text-gray-900">Status: {verification?.status ?? "NOT_SUBMITTED"}</span> · {STATUS_COPY[verification?.status ?? "NOT_SUBMITTED"]}</p>
          {submitted && <p role="status" className="mt-3 text-sm text-green-700">Verification submission sent for review.</p>}
          {submit.isError && <p role="alert" className="mt-3 text-sm text-red-600">{submit.error instanceof ApiClientError ? submit.error.message : "We couldn’t submit verification."}</p>}
          {canSubmit && <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="verification-identity-reference" className="block text-sm font-medium text-gray-700">Identity evidence reference</label>
              <input id="verification-identity-reference" required value={identityReference} onChange={(event) => setIdentityReference(event.target.value)} placeholder="Private provider reference" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
              <p className="mt-1 text-xs text-gray-500">Use a private upload/provider reference; do not paste an identity document or public URL.</p>
            </div>
            <div>
              <label htmlFor="verification-background-statement" className="block text-sm font-medium text-gray-700">Background statement</label>
              <textarea id="verification-background-statement" required minLength={20} maxLength={1000} value={backgroundStatement} onChange={(event) => setBackgroundStatement(event.target.value)} rows={4} placeholder="Tell us about your practice and professional background." className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
            </div>
            <div>
              <label htmlFor="verification-portfolio-reference" className="block text-sm font-medium text-gray-700">Portfolio evidence reference <span className="font-normal text-gray-500">(optional)</span></label>
              <input id="verification-portfolio-reference" value={portfolioReference} onChange={(event) => setPortfolioReference(event.target.value)} placeholder="Private provider reference" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
            </div>
            <Button type="submit" loading={submit.isPending}>Submit for review</Button>
          </form>}
        </>
      )}
    </section>
  );
}
