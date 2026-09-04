import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, notFound, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema } from "@/lib/validators";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const records = await postPurchaseService.listDeliveryRecords(orderId, auth.userId);
  if (!records) return notFound("Order not found");
  return ok(records);
});
