import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { created, forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, CreateArtistSubmissionSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { mediaService } from "@/lib/services/media.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId }, select: { id: true } });
  if (!artist) return forbidden("Artist profile required");
  return ok(await mediaService.listSubmissions(artist.id));
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId }, select: { id: true } });
  if (!artist) return forbidden("Artist profile required");
  return created(await mediaService.submitListing(artist.id, validate(CreateArtistSubmissionSchema, await req.json())));
});
