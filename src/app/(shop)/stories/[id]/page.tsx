import { Suspense } from "react";
import Skeleton from "@/components/ui/Skeleton";
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
    if (story) {storyJsonLd = serializeJsonLd(createStoryJsonLd(story));}
  } catch {
    // Structured data is supplemental; page rendering remains available if the read fails.
  }

  return (
    <>
      {storyJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storyJsonLd }} />
      ) : null}
      <Suspense fallback={<div aria-busy="true" aria-label="Loading story" className="mx-auto max-w-[680px] px-6 py-10"><Skeleton className="aspect-[4/3] w-full rounded-xl" /></div>}>
        <StoryPageClient storyId={id} />
      </Suspense>
    </>
  );
}
