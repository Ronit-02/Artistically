import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import SaleBanner from "@/components/layout/SaleBanner";
import PageHeader from "@/components/ui/PageHeader";
import PhotographyGallery from "./PhotographyGallery";

export const metadata: Metadata = {
  title: "Photography — Artistically",
  description: "A photography inspiration gallery, shared for the love of looking. Explore light, places, people, wildlife, and the details in between.",
  alternates: { canonical: "/photography" },
};

export default function PhotographyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SaleBanner />
      <Navbar />
      <main className="mx-auto max-w-[1240px] px-6 py-10 sm:px-10 sm:py-16">
        <PageHeader
          title="Photography"
          subtitle="A place to pause. Light, life, and the moments that make us look a little longer."
          breadcrumbs={[{ label: "Photography" }]}
        />
        <PhotographyGallery />
      </main>
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-[1240px] px-6 py-8 text-xs leading-relaxed text-gray-500 sm:px-10">
          <p>Gallery titles and captions are original to Artistically. Photographs are visual references and remain the work of their respective creators.</p>
          <p className="mt-3">Artistically · Photography for the joy of it.</p>
        </div>
      </footer>
    </div>
  );
}
