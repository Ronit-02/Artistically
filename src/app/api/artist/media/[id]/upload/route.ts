import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, withErrorHandler } from "@/lib/api-response";
import { validate, MediaAssetIdSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { mediaStorageProvider, verifyLocalUploadToken } from "@/lib/integrations/media-storage";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const { id } = await (ctx as Ctx).params;
  const assetId = validate(MediaAssetIdSchema, id);
  const asset = await prisma.mediaAsset.findFirst({ where: { id: assetId, artist: { userId: auth.userId }, status: "UPLOADING" } });
  if (!asset) return notFound("Media asset not found");
  if (asset.provider !== "local") return new NextResponse("Direct provider upload required", { status: 405 });
  const token = new URL(req.url).searchParams.get("token");
  if (!token || !verifyLocalUploadToken(asset.providerKey, token)) return new NextResponse("Upload token is invalid or expired", { status: 403 });
  const body = Buffer.from(await req.arrayBuffer());
  if (body.byteLength !== asset.sizeBytes) return new NextResponse("Uploaded file size does not match authorization", { status: 400 });
  const write = mediaStorageProvider().writeLocal;
  if (!write) return new NextResponse("Local media provider is unavailable", { status: 500 });
  await write.call(mediaStorageProvider(), asset.providerKey, body);
  return new NextResponse(null, { status: 204 });
});
