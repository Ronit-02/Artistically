"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, ApiClientError } from "@/lib/api/client";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("Verifying your email address…");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!token) return;
    void apiRequest<{ message: string }>("/api/auth/email-verification/confirm", { method: "POST", body: JSON.stringify({ token }) })
      .then((response) => setMessage(response.message))
      .catch((caught) => { setMessage(caught instanceof ApiClientError ? caught.message : "We could not verify your email. Please request a new link."); setFailed(true); });
  }, [token]);
  const isFailure = failed || !token;
  const displayedMessage = token ? message : "This verification link is invalid or incomplete.";
  return <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12"><section className="w-full rounded-xl border border-gray-200 bg-white p-6"><h1 className="text-2xl font-semibold text-gray-900">Verify your email</h1><p role={isFailure ? "alert" : "status"} className="mt-3 text-sm text-gray-700">{displayedMessage}</p><Link className="mt-5 inline-flex min-h-11 items-center text-sm text-gray-700 underline" href={isFailure ? "/login" : "/"}>{isFailure ? "Back to sign in" : "Continue to Artistically"}</Link></section></main>;
}
