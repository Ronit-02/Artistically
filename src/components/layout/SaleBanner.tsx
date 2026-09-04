"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const DISMISSED_KEY = "artistically_announcement_dismissed";

function subscribeToDismissal(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getDismissedSnapshot() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerDismissedSnapshot() {
  return false;
}

export default function SaleBanner() {
  const dismissed = useSyncExternalStore(subscribeToDismissal, getDismissedSnapshot, getServerDismissedSnapshot);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Storage can be unavailable; the announcement remains visible in that case.
    }
    window.dispatchEvent(new Event("storage"));
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#111] text-white relative">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-2.5 flex items-center justify-center gap-3 text-center">
        <p className="text-[12px] sm:text-[13px] tracking-wide">
          <span className="text-accent-200 font-semibold">Discover original art</span>
          <span className="text-white/50 mx-2">-</span>
          Meet independent artists and explore their published work.
          <Link href="/artists" className="text-white underline underline-offset-2 decoration-white/30 hover:decoration-white ml-2 transition-colors">
            Meet the artists
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          aria-label="Dismiss announcement"
        >
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}
