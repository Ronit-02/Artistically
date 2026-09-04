import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Terms of Service</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically is being developed as a curated marketplace for independent artists and collectors. Artwork information, availability, pricing, policies, and seller details must be reviewed before any purchase decision.</p>
        <p>The current release is not a live payment or fulfillment service: checkout is disabled, and a cart or demonstration order must not be treated as a completed sale, payment, shipment, or ownership transfer.</p>
        <p>This is a pre-launch terms draft that requires legal and operational review before launch. Questions can be sent to{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
