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
    <nav aria-label="Breadcrumb" className={`text-[13px] text-gray-500 ${className}`}>
      <ol className="flex items-center gap-2 list-none m-0 p-0">
        <li>
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-accent-600 transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const isCurrentPage = i === items.length - 1 && !item.href && !item.onClick;

          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-gray-200">/</span>
              {item.href ? (
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-accent-600 transition-colors">
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="inline-flex min-h-11 items-center hover:text-accent-600 transition-colors bg-transparent border-none cursor-pointer p-0 text-gray-500 text-[13px]"
                >
                  {item.label}
                </button>
              ) : (
                <span aria-current={isCurrentPage ? "page" : undefined} className="text-gray-600">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
