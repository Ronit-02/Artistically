import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";
import { InvalidStateError } from "@/lib/domain-errors";

type Limit = { max: number; windowMs: number };
const memory = new Map<string, { count: number; expiresAt: number }>();

export function opaqueRateLimitKey(namespace: string, value: string) {
  return `${namespace}:${createHash("sha256").update(value).digest("hex")}`;
}

export async function enforceRateLimit(key: string, { max, windowMs }: Limit) {
  const now = Date.now();
  if (serverEnv.NODE_ENV !== "production") {
    const current = memory.get(key);
    if (!current || current.expiresAt <= now) { memory.set(key, { count: 1, expiresAt: now + windowMs }); return; }
    if (current.count >= max) {throw new RateLimitError();}
    current.count += 1;
    return;
  }
  const expiresAt = new Date(now + windowMs);
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.securityRateLimit.findUnique({ where: { key } });
    if (!existing || existing.expiresAt <= new Date(now)) {
      return tx.securityRateLimit.upsert({ where: { key }, create: { key, count: 1, expiresAt }, update: { count: 1, expiresAt } });
    }
    if (existing.count >= max) {throw new RateLimitError();}
    const updated = await tx.securityRateLimit.updateMany({ where: { key, count: existing.count, expiresAt: { gt: new Date(now) } }, data: { count: { increment: 1 } } });
    if (updated.count !== 1) {throw new RateLimitError();}
    return { count: existing.count + 1 };
  }, { isolationLevel: "Serializable" });
  if (result.count > max) {throw new RateLimitError();}
}

export class RateLimitError extends InvalidStateError {
  constructor() { super("Too many requests. Please try again later."); this.name = "RateLimitError"; }
}
