import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/providers";
import { serverEnv } from "@/lib/env";
import { createWebsiteJsonLd, serializeJsonLd } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  metadataBase: new URL(serverEnv.NEXT_PUBLIC_APP_URL),
  title: "Artistically",
  description: "Discover original paintings, sculptures, ceramics and more from independent artists on an India-first marketplace.",
};

const websiteJsonLd = serializeJsonLd(createWebsiteJsonLd(serverEnv.NEXT_PUBLIC_APP_URL));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon-2.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
