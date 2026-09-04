import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Contact</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>For questions about an artwork, account, order, or artist application, email our team and include the relevant page or order reference.</p>
        <p>We currently support written enquiries at{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
        <p>Artistically is in a staged development release. We will confirm whether a request can be handled before asking for additional personal or payment information.</p>
      </div>
    </div>
  );
}
