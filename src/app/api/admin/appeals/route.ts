// GET /api/admin/appeals — list moderation appeals (admin only)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, AdminAppealQuerySchema } from "@/lib/validators";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const statusValue = req.nextUrl.searchParams.get("status") ?? undefined;
  const { status } = validate(AdminAppealQuerySchema, { status: statusValue });
  const appeals = await prisma.moderationAppeal.findMany({
    where: status ? { status } : undefined,
    include: {
      appellant: { select: { id: true, firstName: true, lastName: true, email: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true } },
      report: {
        select: {
          id: true,
          reason: true,
          product: { select: { id: true, title: true, isActive: true } },
          collection: { select: { id: true, name: true, published: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return ok(appeals);
});
