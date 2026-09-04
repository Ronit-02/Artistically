// POST /api/internal/settlements/reconcile — retry pending seller transfers

import { NextRequest } from "next/server";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { connectService } from "@/lib/services/connect.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const configuredSecret = serverEnv.FULFILLMENT_CRON_SECRET;
  const suppliedSecret = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configuredSecret || suppliedSecret !== configuredSecret) return forbidden("Settlement reconciliation is not authorized");
  return ok(await connectService.reconcilePendingTransfers());
});
