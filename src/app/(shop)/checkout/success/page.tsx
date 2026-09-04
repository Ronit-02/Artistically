"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const sessionId = useSearchParams().get("session_id");

  return (
    <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-20 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700" aria-hidden="true">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </svg>
      </div>
      <h1 className="font-heading text-[30px] font-semibold tracking-tight-heading text-[#111]">Payment submitted</h1>
      <p className="mt-3 text-[15px] leading-7 text-gray-500">
        Stripe has returned you to Artistically. Your order will appear in your account after the verified payment event is processed.
      </p>
      {sessionId && <p className="mt-4 break-all text-xs text-gray-500">Payment session: {sessionId}</p>}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/profile?tab=orders" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#151515] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">View my orders</Link>
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">Continue shopping</Link>
      </div>
    </div>
  );
}
