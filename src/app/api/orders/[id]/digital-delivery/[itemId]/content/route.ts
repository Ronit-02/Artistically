import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { InvalidStateError } from "@/lib/domain-errors";
import { notFound, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema } from "@/lib/validators";
import { digitalAssetUrl, postPurchaseService, verifyDigitalDownloadToken } from "@/lib/services/post-purchase.service";
import { mediaService } from "@/lib/services/media.service";
import { mediaStorageProvider } from "@/lib/integrations/media-storage";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id, itemId } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const orderItemId = validate(RouteIdSchema, { id: itemId }).id;
  const token = new URL(req.url).searchParams.get("token");
  if (!token || !verifyDigitalDownloadToken(token, { orderId, orderItemId, userId: auth.userId })) {
    throw new InvalidStateError("Digital download link is invalid or expired");
  }
  const delivery = await postPurchaseService.downloadDigitalDelivery(orderId, orderItemId, auth.userId, true);
  if (!delivery) return notFound("Digital delivery not found");
  if (delivery.mediaAssetId) {
    const asset = await mediaService.getPrivateAssetForDownload(delivery.mediaAssetId);
    if (!asset) return notFound("Protected digital file not found");
    if (asset.provider === "local") {
      const read = mediaStorageProvider().readLocal;
      if (!read) return notFound("Media provider unavailable");
      return new NextResponse(new Uint8Array(await read.call(mediaStorageProvider(), asset.providerKey)), { headers: { "Content-Type": asset.mimeType, "Content-Disposition": `attachment; filename="${asset.originalName.replaceAll('"', "")}"`, "Cache-Control": "private, no-store" } });
    }
    return NextResponse.redirect(await mediaStorageProvider().getDownloadUrl(asset.providerKey, 300), 302);
  }
  return NextResponse.redirect(digitalAssetUrl(delivery.assetReference), 302);
});
