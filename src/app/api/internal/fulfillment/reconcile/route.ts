import { NextRequest } from "next/server";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { postPurchaseService } from "@/lib/services/post-purchase.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const configuredSecret = serverEnv.FULFILLMENT_CRON_SECRET;
  const suppliedSecret = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configuredSecret || suppliedSecret !== configuredSecret) return forbidden("Fulfillment reconciliation is not authorized");
  return ok(await postPurchaseService.reconcileFulfillment());
});
