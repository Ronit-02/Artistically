// POST /api/auth/register
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { validate, RegisterSchema } from "@/lib/validators";
import { created, conflict, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const input = validate(RegisterSchema, body);

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return conflict("An account with this email already exists");

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

  const token = await signToken({ userId: user.id, email: user.email, role: user.role });
  await setAuthCookie(token);

  return created({ user, token });
});
