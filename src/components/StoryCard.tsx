import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/types";

function formatEditorialTitle(title: string) {
  if (title !== title.toUpperCase()) {return title;}
  const normalized = title.toLowerCase();
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

export default function StoryCard({ story, headingLevel = 3 }: { story: Story; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link href={`/stories/${story.id}`} className="card-hover group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
      <div className="img-hover-zoom relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f5f5f5]">
        <Image src={story.image} alt={story.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>
      </div>
      <div className="pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-gray-500">
          <span className="text-accent-600">{story.category ?? "Journal"}</span>
          <span aria-hidden="true" className="text-gray-500 opacity-50">/</span>
          <time dateTime={story.date}>{new Date(story.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
        </div>
        <Heading className="font-heading text-[20px] font-semibold leading-[1.3] tracking-tight-heading text-[#111] line-clamp-3">{formatEditorialTitle(story.title)}</Heading>
        {story.excerpt && <p className="mt-2.5 text-[14px] leading-relaxed text-gray-500 line-clamp-2">{story.excerpt}</p>}
      </div>
    </Link>
  );
}
