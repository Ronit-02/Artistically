"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./Button";

type NotFoundStateProps = {
  description: string;
  title: string;
};

export default function NotFoundState({ description, title }: NotFoundStateProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <section className="mx-auto flex min-h-[52vh] max-w-[680px] flex-col items-center justify-center px-6 py-20 text-center sm:px-10" aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="font-heading text-3xl font-semibold leading-tight tracking-tighter-heading text-[#111] sm:text-4xl">{title}</h1>
      <p className="mt-5 max-w-[560px] text-base leading-relaxed text-gray-500 sm:text-lg">{description}</p>
      <div className="mt-10 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
        <Button variant="secondary" onClick={handleBack}>Go back</Button>
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:ring-offset-2">
          Go to homepage
        </Link>
      </div>
    </section>
  );
}
