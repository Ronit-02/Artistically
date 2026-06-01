// GET   /api/artists/[id]  — artist profile + products
// PATCH /api/artists/[id]  — update own profile
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, UpdateArtistSchema } from "@/lib/validators";
import { ok, notFound, forbidden, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;

  const artist = await prisma.artist.findUnique({
    where: { id },
    select: {
      id: true,
      handle: true,
      bio: true,
      cover: true,
      verified: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, avatar: true } },
      _count: { select: { products: true, followers: true } },
      products: {
        where: { isActive: true },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          originalPrice: true,
          discount: true,
          category: true,
          badge: true,
          images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  if (!artist) return notFound("Artist not found");
  return ok(artist);
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) return notFound("Artist not found");
  if (artist.userId !== auth.userId) return forbidden("You can only edit your own profile");

  const body = await req.json();
  const input = validate(UpdateArtistSchema, body);

  const updated = await prisma.artist.update({
    where: { id },
    data: input,
    select: {
      id: true, handle: true, bio: true, cover: true, verified: true,
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
  });

  return ok(updated);
});
