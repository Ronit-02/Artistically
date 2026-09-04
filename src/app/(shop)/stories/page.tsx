"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { useStories } from "@/hooks/useStories";

export default function StoriesPage() {
  const { data: stories = [], isPending, isError, refetch } = useStories();

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <PageHeader title="Stories" subtitle="Practical notes on making, collecting, and living with art." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Stories" }]} />
      {isPending ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading stories"><div className="h-80 animate-pulse rounded-xl bg-gray-50" /><div className="h-80 animate-pulse rounded-xl bg-gray-50" /><div className="h-80 animate-pulse rounded-xl bg-gray-50" /></div> : isError ? (
        <div className="py-16 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load the editorial journal.</p><Button variant="secondary" onClick={() => refetch()}>Try Again</Button></div>
      ) : stories.length === 0 ? <p className="py-16 text-center text-sm text-gray-500">No stories have been published yet.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => <Link key={story.id} href={`/stories/${story.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-50 mb-4"><Image src={story.image} alt={story.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" /></div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2"><span className="uppercase tracking-wider text-accent-600">{story.category ?? "Journal"}</span><span aria-hidden="true">·</span><span>{new Date(story.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            <h2 className="font-heading text-lg font-semibold text-gray-900 leading-snug">{story.title}</h2>
            {story.excerpt && <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-3">{story.excerpt}</p>}
          </Link>)}
        </div>
      )}
    </div>
  );
}
