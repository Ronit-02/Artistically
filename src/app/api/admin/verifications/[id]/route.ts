// PATCH /api/admin/verifications/[id] — record an administrator decision

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, DecideArtistVerificationSchema, RouteIdSchema } from "@/lib/validators";
import { verificationService } from "@/lib/services/verification.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const verificationId = validate(RouteIdSchema, { id }).id;
  const input = validate(DecideArtistVerificationSchema, await req.json());
  const verification = await verificationService.decideForAdmin(verificationId, auth.userId, input);
  if (!verification) return notFound("Verification case not found");
  return ok(verification);
});
