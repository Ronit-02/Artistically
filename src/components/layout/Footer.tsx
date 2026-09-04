import Link from "next/link";
import Logo from "@/components/ui/Logo";

const LINKS = {
  Marketplace: [
    { label: "Paintings", href: "/search?type=Painting" },
    { label: "Sculptures", href: "/search?type=Sculpture" },
    { label: "Ceramics", href: "/search?type=Ceramics" },
    { label: "Collections", href: "/collections" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Artists: [
    { label: "Sell on Artistically", href: "/artist-portal" },
    { label: "Artist Guidelines", href: "/artist-guidelines" },
    { label: "Commission Work", href: "/commissions" },
    { label: "Partner Program", href: "/partners" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-24">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-16 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-2 lg:mb-0">
            <Logo size={30} />
            <p className="text-[13px] text-gray-500 mt-4 leading-relaxed max-w-xs">
              Original art from independent artists. Curated with care and presented with clear artwork facts.
            </p>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <nav key={section} aria-labelledby={`footer-${section.toLowerCase()}`}>
              <h4 id={`footer-${section.toLowerCase()}`} className="font-heading text-[13px] font-semibold text-[#111] uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-3 list-none m-0 p-0">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 items-center text-[13px] text-gray-500 hover:text-accent-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex justify-center">
          <p className="text-[12px] text-gray-500">
            © {new Date().getFullYear()} Artistically. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
