import type { NextConfig } from "next";
import catalogManifest from "./src/data/catalog-image-manifest.json";

const isDevelopment = process.env.NODE_ENV === "development";
const catalogUrls: { url: string; filePath: string }[] = catalogManifest.images;
const firstCatalogUrl = catalogUrls[0] ? new URL(catalogUrls[0].url) : undefined;
const imagekitEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "")
  ?? (firstCatalogUrl ? `${firstCatalogUrl.origin}${firstCatalogUrl.pathname.slice(0, -catalogUrls[0].filePath.length)}` : undefined);

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      ...(imagekitEndpoint ? [new URL(`${imagekitEndpoint}/artistically/**`)] : []),
      new URL("https://mymodernmet.com/wp/wp-content/uploads/2021/07/caravaggio-calling-of-saint-matthew.jpeg"),
      new URL("https://mymodernmet.com/wp/wp-content/uploads/2021/07/edward-hopper-nighthawks-1.jpeg"),
      new URL("https://www.angelaedwards.co.uk/wp-content/uploads/2022/07/Guernica-1024x511-1.jpg"),
      new URL("https://cdna.artstation.com/p/assets/images/images/024/928/898/large/jhon-gal-indian-paintings.jpg?1583990213"),
      new URL("https://lh7-rt.googleusercontent.com/docsz/AD_4nXcqByFFiBiI7dG7-YQeq-MqpjZcLYrUZ9B-5D6pl22Eiooo6ZlS0qqgkTc0n_4pcRiDwnj7aIhei3PhKMUvxgObsfMy3h8yZs1ezH0EJstWXKOxnJDv3Kwy7YY5Ou8sr1SPWQyl?key=rsin6iOewnZx508oJll35A"),
      {"protocol":"https","hostname":"dehchtauiq0z6.cloudfront.net","port":"","pathname":"/media/*","search":""},
      {"protocol":"https","hostname":"galeriemontblanc.com","port":"","pathname":"/cdn/shop/files/*"},
      {"protocol":"https","hostname":"artazzle.com","port":"","pathname":"/cdn/shop/files/*"},
      { protocol: "https", hostname: "alphauniverseglobal.media.zestyio.com", port: "", pathname: "/*", search: "" },
      { protocol: "https", hostname: "mymodernmet.com", port: "", pathname: "/wp/wp-content/uploads/2024/11/*", search: "" },
      { protocol: "https", hostname: "webneel.com", port: "", pathname: "/daily/sites/default/files/images/daily/11-2017/*", search: "" },
      { protocol: "https", hostname: "www.sofst.org", port: "", pathname: "/wp-content/uploads/**", search: "" },
      { protocol: "https", hostname: "sixtysixmag.com", port: "", pathname: "/wp-content/uploads/*", search: "" },
      { protocol: "https", hostname: "media.admiddleeast.com", port: "", pathname: "/photos/**", search: "" },
      { protocol: "https", hostname: "stephentravels.com", port: "", pathname: "/wp-content/uploads/2022/06/*", search: "" },
      { protocol: "https", hostname: "ik.imagekit.io", port: "", pathname: "/theartling/prod/**", search: "" },
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Patchen2_large.jpg?v=1598864632"),
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Peters1_large.jpg?v=1598864651"),
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Peters2_large.jpg?v=1598864668"),
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Burchetta2_large.jpg?v=1598864741"),
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Lipofsky1_large.jpg?v=1598864761"),
      new URL("https://cdn.shopify.com/s/files/1/0836/2769/files/Svenson_large.jpg?v=1598864793"),
      { protocol: "https", hostname: "www.singulart.com", port: "", pathname: "/blog/wp-content/uploads/2023/10/*", search: "" },
      { protocol: "https", hostname: "www.singulart.com", port: "", pathname: "/blog/wp-content/uploads/2024/05/*", search: "" },
      { protocol: "https", hostname: "www.contemporaryartissue.com", port: "", pathname: "/wp-content/uploads/2025/10/*", search: "" },
      { protocol: "https", hostname: "d7hftxdivxxvm.cloudfront.net", port: "", pathname: "/" },
      { protocol: "https", hostname: "www.ignant.com", port: "", pathname: "/wp-content/uploads/2014/03/*", search: "" },
      { protocol: "https", hostname: "www.treecarving.co.uk", port: "", pathname: "/wp-content/uploads/2020/12/*", search: "" },
      { protocol: "https", hostname: "i.etsystatic.com", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "cdn.canadianwoodworking.com", port: "", pathname: "/wp-content/uploads/2021/03/**", search: "" },
      { protocol: "https", hostname: "journal.atp.art", port: "", pathname: "/wp-content/uploads/2022/12/*", search: "" },
      new URL("https://www.interfibers.com/cdn/shop/files/39.jpg?v=1738881540&width=823"),
      new URL("https://www.interfibers.com/cdn/shop/files/37.jpg?v=1738880938&width=823"),
      { protocol: "https", hostname: "images.saatchiart.com", port: "", pathname: "/saatchi/**", search: "" },
      { protocol: "https", hostname: "cdn.mos.cms.futurecdn.net", port: "", pathname: "/*", search: "" },
      { protocol: "https", hostname: "www.artchive.com", port: "", pathname: "/wp-content/uploads/2024/07/*", search: "" },
      new URL("https://miro.medium.com/0*TV9cd23PvjDtsnT3.jpg"),
      { protocol: "https", hostname: "media.gq-magazine.co.uk", port: "", pathname: "/photos/**", search: "" },
      { protocol: "https", hostname: "i0.wp.com", port: "", pathname: "/d16kd6gzalkogb.cloudfront.net/magazine_images/**", search: "?ssl=1" },
      ...["5", "2"].map((number) => new URL(`https://www.artfund.org/_amplify/image?url=https:%2F%2Fdw4k6npnyoqvk.cloudfront.net%2Fnews%2F2013%2F08%2Ftop-ten-british%2Ftop-ten-british-${number}.jpg&w=1536&format=webp&q=75`)),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://media.gq-magazine.co.uk https://i0.wp.com https://www.artfund.org https://cdn.mos.cms.futurecdn.net https://www.artchive.com https://miro.medium.com https://images.saatchiart.com https://www.ignant.com https://www.treecarving.co.uk https://i.etsystatic.com https://cdn.canadianwoodworking.com https://journal.atp.art https://www.interfibers.com https://www.singulart.com https://www.contemporaryartissue.com https://d7hftxdivxxvm.cloudfront.net https://stephentravels.com https://ik.imagekit.io https://cdn.shopify.com https://www.sofst.org https://sixtysixmag.com https://media.admiddleeast.com https://alphauniverseglobal.media.zestyio.com https://mymodernmet.com https://webneel.com https://plus.unsplash.com https://dehchtauiq0z6.cloudfront.net https://www.angelaedwards.co.uk https://galeriemontblanc.com https://cdna.artstation.com https://lh7-rt.googleusercontent.com https://artazzle.com; font-src 'self' data:; connect-src 'self'; frame-src https://checkout.stripe.com; upgrade-insecure-requests` },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];
    if (process.env.NODE_ENV === "production") headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
