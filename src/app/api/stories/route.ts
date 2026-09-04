// GET /api/stories — list published editorial stories
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async () => {
  const stories = await prisma.story.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      image: true,
      category: true,
      createdAt: true,
    },
  });

  return ok(stories.map((story) => ({ ...story, date: story.createdAt.toISOString() })));
});
