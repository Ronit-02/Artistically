import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-400 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Contact</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>
          Artistically is a curated marketplace connecting art lovers with independent artists worldwide.
          We believe great art should be accessible, and every purchase supports a working artist directly.
        </p>
        <p>
          Our platform makes it easy to discover original paintings, sculptures, ceramics, and more —
          each piece hand-selected for quality and authenticity.
        </p>
        <p>
          This page is currently being updated. For any questions, reach out at{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
