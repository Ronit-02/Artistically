"use client";

import Image from "next/image";
import Link from "next/link";
import { useStory, useStories } from "@/hooks/useStories";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function StoryPageClient({ storyId }: { storyId: number }) {
  const { data: story, isLoading } = useStory(storyId);
  const { data: allStories } = useStories();

  if (isLoading) return <div className="min-h-screen animate-pulse bg-[#fafafa]" />;
  if (!story) return <div className="text-center py-20 text-gray-400">Story not found.</div>;

  const otherStories = (allStories ?? []).filter((s) => s.id !== story.id);

  return (
    <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
      <Breadcrumb items={[{ label: "Stories", href: "/" }, { label: story.title }]} className="mb-6"/>

      {/* Hero image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-[#f5f5f5]">
        <Image src={story.image} alt={story.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 840px" priority/>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4 text-[13px] text-gray-400">
        {story.category && <span className="font-medium uppercase tracking-wider text-[11px] text-accent-600">{story.category}</span>}
        {story.category && <span>·</span>}
        <span>{new Date(story.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
      </div>

      <h1 className="font-heading text-[2rem] sm:text-[2.5rem] font-bold text-[#111] mb-6 leading-[1.1] tracking-tighter-heading">{story.title}</h1>
      {story.excerpt && <p className="text-[17px] text-gray-400 leading-relaxed mb-8">{story.excerpt}</p>}

      <div className="space-y-5 text-[16px] text-[#555] leading-[1.8] mb-16">
        <p>Art has always been a medium through which humanity expresses its deepest emotions and ideas. From the earliest cave paintings to the digital canvases of today, artists have sought to capture what words cannot.</p>
        <p>In this piece, we explore the intersection of tradition and innovation — how contemporary artists are drawing from centuries of technique while pushing the boundaries of their medium.</p>
        <p>The result is a vibrant dialogue between past and present, old materials and new visions, creating art that resonates across generations.</p>
      </div>

      {/* Related */}
      {otherStories.length > 0 && (
        <div className="border-t border-gray-100 pt-12">
          <h2 className="font-heading text-[22px] font-semibold text-[#111] mb-6 tracking-tight-heading">More Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {otherStories.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/stories/${s.id}`} className="group flex gap-4 items-start">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#f5f5f5]">
                  <Image src={s.image} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-300 mb-1 uppercase tracking-wider">{s.category}</p>
                  <p className="text-[15px] font-heading font-medium text-[#111] group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">{s.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
