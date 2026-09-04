import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, PublishDigitalDeliverySchema } from "@/lib/validators";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const { id } = await (ctx as Ctx).params;
  const orderItemId = validate(RouteIdSchema, { id }).id;
  const input = validate(PublishDigitalDeliverySchema, await req.json());
  const delivery = await postPurchaseService.publishDigitalDelivery(orderItemId, auth.userId, input.assetReference, input.downloadLimit);
  if (!delivery) return notFound("Order item not found or not yours");
  return ok(delivery);
});
