"use client";

import { useState } from "react";
import Link from "next/link";

export default function SaleBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-[#111] text-white relative">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-2.5 flex items-center justify-center gap-3 text-center">
        <p className="text-[12px] sm:text-[13px] tracking-wide">
          <span className="text-accent-200 font-semibold">Summer Sale</span>
          <span className="text-white/50 mx-2">-</span>
          Up to 40% off on selected original artworks.
          <Link href="/search" className="text-white underline underline-offset-2 decoration-white/30 hover:decoration-white ml-2 transition-colors">
            Shop now
          </Link>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}
