import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, AdminReviewQuerySchema } from "@/lib/validators";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { status } = validate(AdminReviewQuerySchema, { status: req.nextUrl.searchParams.get("status") ?? undefined });
  const reviews = await prisma.review.findMany({ where: status ? { moderationStatus: status } : undefined, orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, product: { select: { id: true, title: true } }, moderatedBy: { select: { id: true, firstName: true, lastName: true } } } });
  return ok(reviews);
});
