// POST /api/artist/connect — create or resume Stripe Connect onboarding

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, CreateConnectLinkSchema } from "@/lib/validators";
import { connectService } from "@/lib/services/connect.service";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artists only");
  const input = validate(CreateConnectLinkSchema, await req.json());
  return ok(await connectService.createOnboardingLink(auth.userId, input));
});
