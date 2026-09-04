import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { notFound, forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, MediaAssetIdSchema, CompleteMediaUploadSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { mediaService } from "@/lib/services/media.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId }, select: { id: true } });
  if (!artist) return forbidden("Artist profile required");
  const { id } = await (ctx as Ctx).params;
  const assetId = validate(MediaAssetIdSchema, id);
  const asset = await mediaService.completeUpload(artist.id, assetId, validate(CompleteMediaUploadSchema, await req.json()).checksum);
  if (!asset) return notFound("Media asset not found or already completed");
  return ok({ id: asset.id, purpose: asset.purpose, status: asset.status, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes });
});
