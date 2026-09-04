import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Shipping & Returns</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Shipping availability, origin, processing time, delivery estimate, and shipping charge must be shown from listing and order data before a real checkout is enabled.</p>
        <p>The current release does not provide payment-backed checkout or a shipping-provider tracking integration. The cart therefore keeps checkout disabled rather than presenting an unverified delivery promise.</p>
        <p>For a shipping question about a specific artwork, contact{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
