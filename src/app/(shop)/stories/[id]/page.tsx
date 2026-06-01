import { Suspense } from "react";
import StoryPageClient from "./StoryPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
      <StoryPageClient storyId={Number(id)} />
    </Suspense>
  );
}
