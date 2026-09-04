import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Artist Guidelines</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artists should publish accurate titles, images, mediums, dimensions, condition, edition information, pricing, inventory, and fulfillment details for every artwork.</p>
        <p>Do not submit work that you do not own or have permission to sell. Verification is a review of defined identity and background information; it is not a guarantee of every artwork, price, or future action.</p>
        <p>The listing, upload, verification, and moderation workflows are still being built. Questions about joining the marketplace can be sent to{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
