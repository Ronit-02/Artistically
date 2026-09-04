import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <Link href="/" className="text-[13px] text-gray-500 hover:text-[#111] transition-colors mb-8 inline-block">← Back to Home</Link>
      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] tracking-tighter-heading mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-[15px] text-[#555] leading-[1.8]">
        <p>Artistically processes account details needed for authentication and profile features, along with the artwork, cart, wishlist, review, and order information required for the marketplace experience.</p>
        <p>Protected account data is requested through authenticated application routes. Do not include passwords, payment credentials, identity documents, or other sensitive information in an email enquiry.</p>
        <p>This is a pre-launch product policy draft and is not a substitute for the final privacy notice. Questions about data handling can be sent to{" "}
          <a href="mailto:hello@artistically.com" className="text-[#111] underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-colors">hello@artistically.com</a>
        </p>
      </div>
    </div>
  );
}
