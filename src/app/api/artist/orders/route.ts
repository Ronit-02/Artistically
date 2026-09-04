// GET /api/artist/orders — list incoming order items for the authenticated artist

import { NextRequest } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  return ok(await orderService.listForArtist(auth.userId));
});
