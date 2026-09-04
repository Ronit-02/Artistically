import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, notFound, created, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, CreateDisputeSchema } from "@/lib/validators";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const disputes = await postPurchaseService.listDisputesForUser(orderId, auth.userId);
  if (!disputes) return notFound("Order not found");
  return ok(disputes);
});

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id } = await (ctx as Ctx).params;
  const orderId = validate(RouteIdSchema, { id }).id;
  const dispute = await postPurchaseService.openDispute(orderId, auth.userId, validate(CreateDisputeSchema, await req.json()));
  if (!dispute) return notFound("Order not found");
  return created(dispute);
});
