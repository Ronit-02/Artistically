import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, EvidencePolicySchema } from "@/lib/validators";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  return ok(await prisma.evidenceProviderPolicy.findMany({ orderBy: { providerKey: "asc" } }));
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const input = validate(EvidencePolicySchema, await req.json());
  const policy = await prisma.evidenceProviderPolicy.upsert({ where: { providerKey: input.providerKey }, create: input, update: input });
  await prisma.auditLog.create({ data: { actorId: auth.userId, action: "EVIDENCE_POLICY_UPDATED", targetType: "EVIDENCE_PROVIDER_POLICY", targetId: policy.id, metadata: { retentionDays: policy.retentionDays, active: policy.active } } });
  return ok(policy);
});
