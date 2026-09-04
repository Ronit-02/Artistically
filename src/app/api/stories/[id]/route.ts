// GET /api/stories/[id] — read one published editorial story
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validate, RouteIdSchema } from "@/lib/validators";
import { notFound, ok, withErrorHandler } from "@/lib/api-response";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: NextRequest, ctx: unknown) => {
  void _req;
  const { id } = await (ctx as Context).params;
  const validId = validate(RouteIdSchema, { id }).id;
  const story = await prisma.story.findFirst({
    where: { id: validId, published: true },
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

  if (!story) return notFound("Story not found");
  return ok({ ...story, date: story.createdAt.toISOString() });
});
