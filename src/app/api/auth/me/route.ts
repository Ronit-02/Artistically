// GET /api/auth/me — returns the currently authenticated user
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ok, unauthorized, notFound, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      createdAt: true,
      artist: {
        select: { id: true, handle: true, verified: true },
      },
    },
  });

  if (!user) return notFound("User not found");
  return ok(user);
});
