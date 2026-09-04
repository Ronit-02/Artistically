import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, ResolveDisputeSchema } from "@/lib/validators";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrators only");
  const { id } = await (ctx as Ctx).params;
  const disputeId = validate(RouteIdSchema, { id }).id;
  const input = validate(ResolveDisputeSchema, await req.json());
  const dispute = await postPurchaseService.resolveDispute(disputeId, auth.userId, input.status, input.resolutionNote);
  if (!dispute) return notFound("Dispute not found");
  return ok(dispute);
});
