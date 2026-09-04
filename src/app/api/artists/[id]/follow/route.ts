import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

async function resolveArtistId(ctx: unknown) {
  const { id } = await (ctx as Ctx).params;
  return validate(RouteIdSchema, { id }).id;
}

async function ensureArtist(artistId: string) {
  const artist = await prisma.artist.findUnique({ where: { id: artistId }, select: { id: true } });
  if (!artist) return null;
  return artist.id;
}

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const artistId = await resolveArtistId(ctx);
  if (!(await ensureArtist(artistId))) return notFound("Artist not found");

  const follow = await prisma.follow.findUnique({
    where: { artistId_userId: { artistId, userId: auth.userId } },
    select: { id: true },
  });

  return ok({ following: Boolean(follow) });
});

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const artistId = await resolveArtistId(ctx);
  if (!(await ensureArtist(artistId))) return notFound("Artist not found");
  if (artistId === auth.userId) return forbidden("You cannot follow your own artist profile");

  await prisma.follow.upsert({
    where: { artistId_userId: { artistId, userId: auth.userId } },
    update: {},
    create: { artistId, userId: auth.userId },
  });

  return ok({ following: true });
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const artistId = await resolveArtistId(ctx);
  if (!(await ensureArtist(artistId))) return notFound("Artist not found");

  await prisma.follow.deleteMany({ where: { artistId, userId: auth.userId } });
  return ok({ following: false });
});
