"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-[13px] text-gray-400 ${className}`}>
      <Link href="/" className="hover:text-accent-600 transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-gray-200">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-accent-600 transition-colors">
              {item.label}
            </Link>
          ) : item.onClick ? (
            <button onClick={item.onClick}
              className="hover:text-accent-600 transition-colors bg-transparent border-none cursor-pointer p-0 text-gray-400 text-[13px]">
              {item.label}
            </button>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
