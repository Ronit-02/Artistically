"use client";

import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export default function UnavailablePage() {
  const handleRetry = () => {
    window.location.assign("/");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[760px] flex-col items-center justify-center px-6 py-24 text-center sm:px-10" role="alert">
      <Logo size={58} className="mb-12" />
      <h1 className="max-w-[680px] font-heading text-3xl font-semibold leading-tight tracking-tighter-heading text-[#111] sm:text-4xl">Artistically is temporarily unavailable</h1>
      <p className="mt-5 max-w-[560px] text-base leading-relaxed text-gray-500 sm:text-lg">
        We can’t reach the marketplace right now. Your account and saved items have not been changed. Please try again in a moment.
      </p>
      <Button className="mt-10" onClick={handleRetry}>Try again</Button>
    </main>
  );
}
