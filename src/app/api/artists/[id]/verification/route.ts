// GET  /api/artists/[id]/verification — owner verification state
// POST /api/artists/[id]/verification — submit owner verification evidence references

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forbidden, notFound, ok, created, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, SubmitArtistVerificationSchema } from "@/lib/validators";
import { verificationService } from "@/lib/services/verification.service";

type Ctx = { params: Promise<{ id: string }> };

async function requireArtistOwner(req: NextRequest, id: string) {
  const auth = await requireAuth(req);
  const artist = await prisma.artist.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!artist) return { auth, artist: null };
  if (artist.userId !== auth.userId) return { auth, artist: "forbidden" as const };
  return { auth, artist };
}

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const artistId = validate(RouteIdSchema, { id }).id;
  const result = await requireArtistOwner(req, artistId);
  if (result.artist === null) return notFound("Artist not found");
  if (result.artist === "forbidden") return forbidden("You can only view your own verification");
  return ok(await verificationService.getForOwner(artistId));
});

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const artistId = validate(RouteIdSchema, { id }).id;
  const result = await requireArtistOwner(req, artistId);
  if (result.artist === null) return notFound("Artist not found");
  if (result.artist === "forbidden") return forbidden("You can only submit your own verification");
  const input = validate(SubmitArtistVerificationSchema, await req.json());
  return created(await verificationService.submit(artistId, input));
});
