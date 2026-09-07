// POST /api/auth/register
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAuthSession } from "@/lib/auth";
import { issueAccountToken } from "@/lib/auth-tokens";
import { validate, RegisterSchema } from "@/lib/validators";
import { created, conflict, withErrorHandler } from "@/lib/api-response";
import { enforceRateLimit, opaqueRateLimitKey } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const input = validate(RegisterSchema, body);
  await enforceRateLimit(opaqueRateLimitKey("register", input.email), { max: 3, windowMs: 60 * 60_000 });

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {return conflict("Unable to complete authentication");}

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  await createAuthSession(user);
  await issueAccountToken(user, "EMAIL_VERIFICATION");

  return created({ user });
});
