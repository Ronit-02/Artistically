import { NextRequest, NextResponse } from "next/server";
import { notFound, withErrorHandler } from "@/lib/api-response";
import { validate, MediaAssetIdSchema } from "@/lib/validators";
import { mediaService } from "@/lib/services/media.service";
import { mediaStorageProvider } from "@/lib/integrations/media-storage";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const assetId = validate(MediaAssetIdSchema, id);
  const asset = await mediaService.getPublicAsset(assetId);
  if (!asset) return notFound("Media asset not found");
  if (asset.provider !== "local") return NextResponse.redirect(mediaStorageProvider().publicUrl(asset.providerKey, asset.id), 302);
  const read = mediaStorageProvider().readLocal;
  if (!read) return notFound("Media provider unavailable");
  const bytes = await read.call(mediaStorageProvider(), asset.providerKey);
  return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": asset.mimeType, "Cache-Control": "public, max-age=31536000, immutable" } });
});
