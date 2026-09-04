import { NextRequest } from "next/server";
import { MediaPurpose } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { created, forbidden, withErrorHandler } from "@/lib/api-response";
import { validate, CreateMediaUploadSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { mediaService } from "@/lib/services/media.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId }, select: { id: true } });
  if (!artist) return forbidden("Artist profile required");
  const input = validate(CreateMediaUploadSchema, await req.json());
  return created(await mediaService.authorizeUpload(artist.id, { ...input, purpose: input.purpose as MediaPurpose }));
});
