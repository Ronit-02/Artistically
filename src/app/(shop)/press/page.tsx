import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Press</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically is developing an editorial marketplace for original work by independent artists, with discovery and trustworthy commerce at its core.</p>
        <p>Press enquiries should identify the publication or project, deadline, requested subject, and any specific information or image usage needed. Artistically will confirm what material is available before anything is attributed or published.</p>
        <p>Contact the team at{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
