import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Commission Work</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically does not currently operate a managed commission-request workflow. A commission enquiry should include the requested medium, approximate dimensions, intended use, budget range, and preferred timing.</p>
        <p>Do not treat an email enquiry as an accepted commission, quote, delivery promise, or payment request. We will confirm whether the request can be matched with an artist before discussing next steps.</p>
        <p>Send commission enquiries to{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
