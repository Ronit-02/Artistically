import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, DownloadDigitalDeliverySchema } from "@/lib/validators";
import { createDigitalDownloadToken, postPurchaseService } from "@/lib/services/post-purchase.service";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id, itemId } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const orderItemId = validate(RouteIdSchema, { id: itemId }).id;
  const delivery = await postPurchaseService.getDigitalDelivery(orderId, orderItemId, auth.userId);
  if (!delivery) return notFound("Digital delivery not found");
  const token = createDigitalDownloadToken({ orderId, orderItemId, userId: auth.userId });
  return ok({ ...delivery, assetReference: undefined, downloadUrl: `/api/orders/${orderId}/digital-delivery/${orderItemId}/content?token=${encodeURIComponent(token)}` });
});

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id, itemId } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const orderItemId = validate(RouteIdSchema, { id: itemId }).id;
  const delivery = await postPurchaseService.prepareDigitalDownload(orderId, orderItemId, auth.userId, validate(DownloadDigitalDeliverySchema, await req.json()).acceptLicense);
  if (!delivery) return notFound("Digital delivery not found");
  const token = createDigitalDownloadToken({ orderId, orderItemId, userId: auth.userId });
  return ok({ ...delivery, downloadUrl: `/api/orders/${orderId}/digital-delivery/${orderItemId}/content?token=${encodeURIComponent(token)}` });
});
