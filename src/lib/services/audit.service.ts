import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditInput = {
  actorId?: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};

export const auditService = {
  record(input: AuditInput, client = prisma) {
    const { actorId, metadata, ...data } = input;
    const auditData = {
      ...data,
      ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      ...(actorId ? { actor: { connect: { id: actorId } } } : {}),
    } as Prisma.AuditLogCreateInput;
    return client.auditLog.create({ data: auditData });
  },

  list(targetType?: string, targetId?: string) {
    return prisma.auditLog.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  },
};
