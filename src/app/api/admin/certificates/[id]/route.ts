import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, RouteIdSchema, UpdateCertificateSchema } from "@/lib/validators";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const { id } = await (ctx as Ctx).params;
  const certificateId = validate(RouteIdSchema, { id }).id;
  const input = validate(UpdateCertificateSchema, await req.json());
  const existing = await prisma.certificateOfAuthenticity.findUnique({ where: { id: certificateId }, select: { id: true } });
  if (!existing) return notFound("Certificate not found");
  const updated = await prisma.$transaction(async (tx) => {
    const certificate = await tx.certificateOfAuthenticity.update({ where: { id: certificateId }, data: { status: input.status, note: input.note, verifiedAt: input.status === "VERIFIED" ? new Date() : null, revokedAt: input.status === "REVOKED" ? new Date() : null }, include: { product: { select: { id: true, title: true, isActive: true } }, artist: { select: { id: true, handle: true } } } });
    await tx.auditLog.create({ data: { actorId: auth.userId, action: `CERTIFICATE_${input.status}`, targetType: "CERTIFICATE", targetId: certificateId, reason: input.note } });
    return certificate;
  });
  return ok(updated);
});
