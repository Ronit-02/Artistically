import type { Metadata } from "next";

const MAX_DESCRIPTION_LENGTH = 160;

function compactDescription(value: string | null | undefined, fallback: string): string {
  const compact = value?.replace(/\s+/g, " ").trim();
  if (!compact) return fallback;
  if (compact.length <= MAX_DESCRIPTION_LENGTH) return compact;
  return `${compact.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export type ProductMetadataInput = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  artistName: string;
  image: string | null;
  price: number;
  stock: number;
};

export type ArtistMetadataInput = {
  id: string;
  name: string;
  handle: string;
  bio: string | null;
  cover: string | null;
};

export type StoryMetadataInput = {
  id: string;
  title: string;
  excerpt: string | null;
  image: string;
  category: string | null;
};

export type CollectionMetadataInput = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  artworkCount: number;
};

export function createProductMetadata(input: ProductMetadataInput): Metadata {
  const title = `${input.title} | Artistically`;
  const description = compactDescription(
    input.description,
    `${input.category} artwork by ${input.artistName} on Artistically.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/products/${encodeURIComponent(input.id)}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(input.image ? { images: [input.image] } : {}),
    },
  };
}

export function createArtistMetadata(input: ArtistMetadataInput): Metadata {
  const displayHandle = input.handle.startsWith("@") ? input.handle : `@${input.handle}`;
  const title = `${input.name} (${displayHandle}) | Artistically`;
  const description = compactDescription(
    input.bio,
    `Discover artwork and the creative practice of ${input.name} on Artistically.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/artists/${encodeURIComponent(input.id)}` },
    openGraph: {
      title,
      description,
      type: "profile",
      ...(input.cover ? { images: [input.cover] } : {}),
    },
  };
}

export function createArtistJsonLd(input: ArtistMetadataInput) {
  const artistUrl = `/artists/${encodeURIComponent(input.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    url: artistUrl,
    ...(input.bio ? { description: compactDescription(input.bio, input.name) } : {}),
    ...(input.cover ? { image: input.cover } : {}),
    additionalProperty: {
      "@type": "PropertyValue",
      name: "Artist handle",
      value: input.handle,
    },
  };
}

export function createStoryMetadata(input: StoryMetadataInput): Metadata {
  const title = `${input.title} | Artistically`;
  const description = compactDescription(
    input.excerpt,
    input.category
      ? `${input.category} from the Artistically editorial journal.`
      : "Stories and perspectives from the Artistically editorial journal.",
  );

  return {
    title,
    description,
    alternates: { canonical: `/stories/${encodeURIComponent(input.id)}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [input.image],
    },
  };
}

export function createStoryJsonLd(input: StoryMetadataInput) {
  const storyUrl = `/stories/${encodeURIComponent(input.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: compactDescription(
      input.excerpt,
      input.category
        ? `${input.category} from the Artistically editorial journal.`
        : "Stories and perspectives from the Artistically editorial journal.",
    ),
    image: [input.image],
    url: storyUrl,
    mainEntityOfPage: storyUrl,
    ...(input.category ? { articleSection: input.category } : {}),
  };
}

export function createCollectionMetadata(input: CollectionMetadataInput): Metadata {
  const title = `${input.name} | Collections | Artistically`;
  const description = compactDescription(
    input.description,
    `${input.artworkCount} artworks selected for this Artistically collection.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/collections/${encodeURIComponent(input.id)}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(input.coverImage ? { images: [input.coverImage] } : {}),
    },
  };
}

export function createCollectionJsonLd(input: CollectionMetadataInput) {
  const collectionUrl = `/collections/${encodeURIComponent(input.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: compactDescription(
      input.description,
      `${input.artworkCount} artworks selected for this Artistically collection.`,
    ),
    url: collectionUrl,
    ...(input.coverImage ? { image: input.coverImage } : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.artworkCount,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
    },
  };
}

export type ProductJsonLdInput = ProductMetadataInput;

export function createWebsiteJsonLd(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Artistically",
    url: normalizedBaseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${normalizedBaseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function createProductJsonLd(input: ProductJsonLdInput) {
  const productUrl = `/products/${encodeURIComponent(input.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: compactDescription(input.description, `${input.category} artwork by ${input.artistName} on Artistically.`),
    category: input.category,
    ...(input.image ? { image: [input.image] } : {}),
    brand: { "@type": "Person", name: input.artistName },
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: input.price.toFixed(2),
      availability: input.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
