import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Careers</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically is a project in active development. We are interested in people who care about independent artists, trustworthy commerce, accessible interfaces, and careful product details.</p>
        <p>There are no published openings on this page yet. Please do not send confidential information or treat an email enquiry as an application or offer.</p>
        <p>For future opportunities, contact{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
