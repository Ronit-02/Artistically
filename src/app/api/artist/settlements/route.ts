// GET /api/artist/settlements — seller allocation and payout reads

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { orderService } from "@/lib/services/order.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  return ok(await orderService.listSettlementsForArtist(auth.userId));
});
