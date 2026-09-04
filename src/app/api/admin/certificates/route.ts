import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, AdminCertificateQuerySchema } from "@/lib/validators";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { status } = validate(AdminCertificateQuerySchema, { status: req.nextUrl.searchParams.get("status") ?? undefined });
  return ok(await prisma.certificateOfAuthenticity.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, include: { product: { select: { id: true, title: true, isActive: true } }, artist: { select: { id: true, handle: true } } } }));
});
