import { Suspense } from "react";
import type { Metadata } from "next";
import { metadataService } from "@/lib/services/metadata.service";
import { createStoryJsonLd, createStoryMetadata, serializeJsonLd } from "@/lib/seo-metadata";
import StoryPageClient from "./StoryPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const story = await metadataService.getStory((await params).id);
    return story ? createStoryMetadata(story) : {};
  } catch {
    return {};
  }
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  let storyJsonLd: string | null = null;
  try {
    const story = await metadataService.getStory(id);
    if (story) storyJsonLd = serializeJsonLd(createStoryJsonLd(story));
  } catch {
    // Structured data is supplemental; page rendering remains available if the read fails.
  }

  return (
    <>
      {storyJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storyJsonLd }} />
      ) : null}
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
        <StoryPageClient storyId={id} />
      </Suspense>
    </>
  );
}
