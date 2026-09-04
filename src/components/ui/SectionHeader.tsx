import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  className?: string;
}

export default function SectionHeader({
  title, subtitle, href, linkLabel = "View all", onLinkClick, className = "",
}: Props) {
  const linkEl = href ? (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[#111] px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#111] transition-all flex-shrink-0">
      {linkLabel}
      <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </Link>
  ) : onLinkClick ? (
    <button type="button" onClick={onLinkClick} className="inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[#111] px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#111] transition-all flex-shrink-0 bg-transparent cursor-pointer">
      {linkLabel}
      <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  ) : null;

  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div>
        <h2 className="font-heading text-[20px] sm:text-[24px] font-semibold text-[#111] tracking-tight-heading leading-snug">{title}</h2>
        {subtitle && <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {linkEl}
    </div>
  );
}
