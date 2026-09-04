// POST /api/artist/payouts — request a payout from the connected account balance

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, CreatePayoutSchema } from "@/lib/validators";
import { connectService } from "@/lib/services/connect.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST") return forbidden("Artists only");
  const input = validate(CreatePayoutSchema, await req.json());
  return ok(await connectService.createPayoutForArtist(auth.userId, input));
});
