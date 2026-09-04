"use client";

import { useId, useState, type ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

export default function AccordionItem({ title, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerId = `${panelId}-trigger`;
  const contentId = `${panelId}-panel`;

  return (
    <div className="border-t border-gray-200 py-4">
      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full min-h-11 flex items-center justify-between text-left bg-transparent border-none cursor-pointer p-0"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-gray-500 motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div id={contentId} role="region" aria-labelledby={triggerId} className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}
