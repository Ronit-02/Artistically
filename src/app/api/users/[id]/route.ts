// GET   /api/users/[id]  — get user profile
// PATCH /api/users/[id]  — update own profile
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema, UpdateUserSchema } from "@/lib/validators";
import { ok, notFound, forbidden, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  avatar: true,
  role: true,
  createdAt: true,
  artist: { select: { id: true, handle: true, verified: true } },
  _count: { select: { orders: true, wishlist: true } },
};

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const validId = validate(RouteIdSchema, { id }).id;

  // Users can only fetch their own profile (admins can fetch anyone)
  if (validId !== auth.userId && auth.role !== "ADMIN") return forbidden();

  const user = await prisma.user.findUnique({ where: { id: validId }, select: safeUserSelect });
  if (!user) return notFound("User not found");
  return ok(user);
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const { id } = await (ctx as Ctx).params;
  const auth = await requireAuth(req);
  const validId = validate(RouteIdSchema, { id }).id;

  if (validId !== auth.userId) return forbidden("You can only edit your own profile");

  const body = await req.json();
  const input = validate(UpdateUserSchema, body);

  const user = await prisma.user.update({
    where: { id: validId },
    data: input,
    select: safeUserSelect,
  });

  return ok(user);
});
