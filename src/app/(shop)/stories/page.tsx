"use client";

import StoryCard from "@/components/StoryCard";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { useStories } from "@/hooks/useStories";

export default function StoriesPage() {
  const { data: stories = [], isPending, isError, refetch } = useStories();

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <PageHeader title="Stories" subtitle="Practical notes on making, collecting, and living with art." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Stories" }]} />
      {isPending ? <div aria-busy="true" aria-label="Loading stories" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="space-y-3"><Skeleton className="aspect-[4/3] w-full rounded-xl" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /></div>)}</div> : isError ? (
        <div className="py-16 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load the editorial journal.</p><Button variant="secondary" onClick={() => refetch()}>Try Again</Button></div>
      ) : stories.length === 0 ? <p className="py-16 text-center text-sm text-gray-500">No stories have been published yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => <StoryCard key={story.id} story={story} headingLevel={2} />)}
        </div>
      )}
    </div>
  );
}
