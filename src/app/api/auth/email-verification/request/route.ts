import { NextRequest } from "next/server";
import { ok, withErrorHandler } from "@/lib/api-response";
import { issueAccountToken } from "@/lib/auth-tokens";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, opaqueRateLimitKey } from "@/lib/rate-limit";
import { RequestAccountTokenSchema, validate } from "@/lib/validators";

const RESPONSE = { message: "If an account needs verification, we sent an email with the next step." };

export const POST = withErrorHandler(async (request: NextRequest) => {
  const input = validate(RequestAccountTokenSchema, await request.json());
  await enforceRateLimit(opaqueRateLimitKey("email-verification", input.email), { max: 3, windowMs: 60 * 60_000 });
  const user = await prisma.user.findFirst({ where: { email: input.email, isActive: true, emailVerifiedAt: null }, select: { id: true, email: true, firstName: true } });
  if (user) await issueAccountToken(user, "EMAIL_VERIFICATION");
  return ok(RESPONSE);
});
