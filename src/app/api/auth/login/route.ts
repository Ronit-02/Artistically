// POST /api/auth/login
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { validate, LoginSchema } from "@/lib/validators";
import { ok, unauthorized, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const input = validate(LoginSchema, body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true, avatar: true },
  });

  if (!user) return unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) return unauthorized("Invalid email or password");

  const { password: _, ...safeUser } = user;
  const token = await signToken({ userId: user.id, email: user.email, role: user.role });
  await setAuthCookie(token);

  return ok({ user: safeUser, token });
});
