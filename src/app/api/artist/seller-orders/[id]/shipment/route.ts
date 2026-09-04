// PATCH /api/artist/seller-orders/[id]/shipment — update an owned shipment

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, UpdateShipmentSchema } from "@/lib/validators";
import { shipmentService } from "@/lib/services/shipment.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const { id } = await (ctx as Ctx).params;
  const sellerOrderId = validate(RouteIdSchema, { id }).id;
  const input = validate(UpdateShipmentSchema, await req.json());
  const shipment = await shipmentService.updateSellerShipment(sellerOrderId, auth.userId, input);
  if (!shipment) return notFound("Seller order not found or not yours");
  return ok(shipment);
});
