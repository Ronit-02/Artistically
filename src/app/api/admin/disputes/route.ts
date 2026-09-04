import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, DisputeQuerySchema } from "@/lib/validators";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrators only");
  const query = validate(DisputeQuerySchema, { status: new URL(req.url).searchParams.get("status") || undefined });
  return ok(await postPurchaseService.listDisputesForAdmin(query.status));
});
