import { describe, expect, it } from "vitest";
import {
  createArtistMetadata,
  createArtistJsonLd,
  createProductJsonLd,
  createProductMetadata,
  serializeJsonLd,
  createStoryMetadata,
  createStoryJsonLd,
  createWebsiteJsonLd,
  createCollectionMetadata,
  createCollectionJsonLd,
} from "@/lib/seo-metadata";

describe("SEO metadata builders", () => {
  it("creates site structured data with the supported search URL", () => {
    expect(createWebsiteJsonLd("https://artistically.example/")).toMatchObject({
      "@type": "WebSite",
      name: "Artistically",
      url: "https://artistically.example",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://artistically.example/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });
  });

  it("creates truthful product metadata with the primary image", () => {
    const metadata = createProductMetadata({
      id: "cmabcdefghijklmnopqrstuvwx",
      title: "Quiet Morning",
      description: "A calm study in blue.",
      category: "PAINTINGS",
      artistName: "Asha Rao",
      image: "/art/quiet-morning.jpg",
      price: 12500,
      stock: 1,
    });

    expect(metadata.title).toBe("Quiet Morning | Artistically");
    expect(metadata.description).toBe("A calm study in blue.");
    expect(metadata.openGraph).toMatchObject({ images: ["/art/quiet-morning.jpg"] });
  });

  it("uses factual fallbacks when artist and story summaries are absent", () => {
    const artist = createArtistMetadata({
      id: "cmabcdefghijklmnopqrstuvwx",
      name: "Asha Rao",
      handle: "asha-rao",
      bio: null,
      cover: null,
    });
    const story = createStoryMetadata({
      id: "cmabcdefghijklmnopqrstuvwx",
      title: "Making Space",
      excerpt: null,
      image: "/stories/making-space.jpg",
      category: "Studio visits",
    });

    expect(artist.description).toContain("Asha Rao");
    expect(artist.title).toBe("Asha Rao (@asha-rao) | Artistically");
    expect(story.description).toBe("Studio visits from the Artistically editorial journal.");
    expect(story.openGraph).toMatchObject({ type: "article" });
  });

  it("creates artist structured data from persisted profile fields", () => {
    const jsonLd = createArtistJsonLd({
      id: "cmabcdefghijklmnopqrstuvwx",
      name: "Asha Rao",
      handle: "@asha_rao",
      bio: "Painter working with layered color.",
      cover: "/artists/asha-cover.jpg",
    });

    expect(jsonLd).toMatchObject({
      "@type": "Person",
      name: "Asha Rao",
      url: "/artists/cmabcdefghijklmnopqrstuvwx",
      description: "Painter working with layered color.",
      image: "/artists/asha-cover.jpg",
      additionalProperty: { value: "@asha_rao" },
    });
  });

  it("does not duplicate the handle prefix in artist metadata", () => {
    expect(createArtistMetadata({
      id: "cmabcdefghijklmnopqrstuvwx",
      name: "Asha Rao",
      handle: "@asha_rao",
      bio: null,
      cover: null,
    }).title).toBe("Asha Rao (@asha_rao) | Artistically");
  });

  it("creates Article structured data from persisted story fields", () => {
    const jsonLd = createStoryJsonLd({
      id: "cmabcdefghijklmnopqrstuvwx",
      title: "Making Space",
      excerpt: "A studio visit.",
      image: "/stories/making-space.jpg",
      category: "Studio visits",
    });

    expect(jsonLd).toMatchObject({
      "@type": "Article",
      headline: "Making Space",
      description: "A studio visit.",
      image: ["/stories/making-space.jpg"],
      url: "/stories/cmabcdefghijklmnopqrstuvwx",
      articleSection: "Studio visits",
    });
  });

  it("creates collection metadata and item-list structured data from persisted fields", () => {
    const input = {
      id: "cmabcdefghijklmnopqrstuvwx",
      name: "Quiet Materials",
      description: "Works shaped by texture and restraint.",
      coverImage: "/collections/quiet-materials.jpg",
      artworkCount: 8,
    };

    expect(createCollectionMetadata(input)).toMatchObject({
      title: "Quiet Materials | Collections | Artistically",
      alternates: { canonical: "/collections/cmabcdefghijklmnopqrstuvwx" },
      openGraph: { images: ["/collections/quiet-materials.jpg"] },
    });
    expect(createCollectionJsonLd(input)).toMatchObject({
      "@type": "CollectionPage",
      name: "Quiet Materials",
      mainEntity: { "@type": "ItemList", numberOfItems: 8 },
    });
  });

  it("limits long descriptions without breaking words", () => {
    const metadata = createProductMetadata({
      id: "cmabcdefghijklmnopqrstuvwx",
      title: "Long description",
      description: "word ".repeat(100),
      category: "PAINTINGS",
      artistName: "Asha Rao",
      image: null,
      price: 1000,
      stock: 0,
    });

    expect(metadata.description).toHaveLength(160);
    expect(metadata.description?.endsWith("…")).toBe(true);
  });

  it("creates safe Product structured data with current stock state", () => {
    const jsonLd = createProductJsonLd({
      id: "cmabcdefghijklmnopqrstuvwx",
      title: "<Quiet Morning>",
      description: "A calm study in blue.",
      category: "PAINTINGS",
      artistName: "Asha Rao",
      image: "/art/quiet-morning.jpg",
      price: 12500,
      stock: 0,
    });

    expect(jsonLd.offers).toMatchObject({
      price: "12500.00",
      priceCurrency: "INR",
      availability: "https://schema.org/OutOfStock",
    });
    expect(serializeJsonLd(jsonLd)).not.toContain("<Quiet Morning>");
  });
});
