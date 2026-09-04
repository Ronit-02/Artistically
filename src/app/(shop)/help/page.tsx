import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Help Center</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically helps collectors discover artwork and learn about the artists who make it. Product pages are the source for the currently available title, images, artist, price, and stock information.</p>
        <p>Accounts, saved items, carts, and order history are tied to the signed-in account. If something looks wrong, do not send payment details by email; contact support with a description of the problem instead.</p>
        <section id="artist-verification" aria-labelledby="artist-verification-heading" className="scroll-mt-6">
          <h2 id="artist-verification-heading" className="font-heading text-xl font-semibold text-[#111]">What the Verified badge means</h2>
          <p className="mt-2">The Verified badge means Artistically reviewed the artist’s identity and background. It does not guarantee a particular artwork, price, valuation, availability, or future action.</p>
        </section>
        <p>For help, reach out at{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
