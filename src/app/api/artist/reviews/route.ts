// GET /api/artist/reviews — list reviews for the authenticated artist’s artwork

import { NextRequest } from "next/server";
import { reviewService } from "@/lib/services/review.service";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  return ok(await reviewService.listForArtist(auth.userId));
});
