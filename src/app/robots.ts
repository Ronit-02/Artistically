import type { MetadataRoute } from "next";
import { serverEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/artist-portal/",
        "/cart/",
        "/login/",
        "/profile/",
        "/tracking/",
        "/wishlist/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
