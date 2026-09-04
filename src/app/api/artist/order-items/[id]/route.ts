// PATCH /api/artist/order-items/[id] — advance a seller-owned fulfillment item

import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema, UpdateFulfillmentStatusSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const { id } = await (ctx as Ctx).params;
  const itemId = validate(RouteIdSchema, { id }).id;
  const { status } = validate(UpdateFulfillmentStatusSchema, await req.json());
  const item = await orderService.updateSellerItemStatus(itemId, auth.userId, status);
  if (!item) return notFound("Order item not found or not yours");
  return ok(item);
});
