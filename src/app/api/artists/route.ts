// GET  /api/artists  — list all artists
// POST /api/artists  — create artist profile for current user
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, CreateArtistSchema } from "@/lib/validators";
import { ok, created, conflict, withErrorHandler } from "@/lib/api-response";

const artistSelect = {
  id: true,
  handle: true,
  bio: true,
  cover: true,
  verified: true,
  createdAt: true,
  user: { select: { firstName: true, lastName: true, avatar: true } },
  _count: { select: { products: true, followers: true } },
};

export const GET = withErrorHandler(async (_req: NextRequest) => {
  const artists = await prisma.artist.findMany({
    select: artistSelect,
    orderBy: { followers: { _count: "desc" } },
  });
  return ok(artists);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await req.json();
  const input = validate(CreateArtistSchema, body);

  const existing = await prisma.artist.findUnique({ where: { userId: auth.userId } });
  if (existing) return conflict("You already have an artist profile");

  const handleTaken = await prisma.artist.findUnique({ where: { handle: input.handle } });
  if (handleTaken) return conflict("This handle is already taken");

  const artist = await prisma.artist.create({
    data: { ...input, userId: auth.userId },
    select: artistSelect,
  });

  // Upgrade user role
  await prisma.user.update({ where: { id: auth.userId }, data: { role: "ARTIST" } });

  return created(artist);
});
