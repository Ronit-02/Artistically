// POST /api/auth/login
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAuthSession } from "@/lib/auth";
import { validate, LoginSchema } from "@/lib/validators";
import { ok, unauthorized, withErrorHandler } from "@/lib/api-response";
import { enforceRateLimit, opaqueRateLimitKey } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const input = validate(LoginSchema, body);
  await enforceRateLimit(opaqueRateLimitKey("login", input.email), { max: 5, windowMs: 15 * 60_000 });

  const user = await prisma.user.findUnique({
    where: { email: input.email, isActive: true },
    select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true, avatar: true },
  });

  if (!user) return unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) return unauthorized("Invalid email or password");

  const safeUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatar,
  };
  await createAuthSession(user);

  return ok({ user: safeUser });
});
