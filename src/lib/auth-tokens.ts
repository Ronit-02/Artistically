import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { AuthTokenPurpose } from "@prisma/client";
import { serverEnv } from "@/lib/env";
import { deliverTransactionalEmail } from "@/lib/integrations/email";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const TOKEN_TTL_MS: Record<AuthTokenPurpose, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenLink(path: string, token: string) {
  const url = new URL(path, serverEnv.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function issueAccountToken(user: { id: string; email: string; firstName: string }, purpose: AuthTokenPurpose) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[purpose]);
  await prisma.$transaction([
    prisma.authToken.updateMany({ where: { userId: user.id, purpose, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.authToken.create({ data: { userId: user.id, purpose, tokenHash: hashToken(token), expiresAt } }),
  ]);

  const isVerification = purpose === "EMAIL_VERIFICATION";
  const link = tokenLink(isVerification ? "/verify-email" : "/reset-password", token);
  try {
    await deliverTransactionalEmail({
      to: user.email,
      eventKey: `${purpose.toLowerCase()}:${hashToken(token)}`,
      subject: isVerification ? "Verify your Artistically email" : "Reset your Artistically password",
      body: `Hello ${user.firstName},\n\n${isVerification ? "Verify your email" : "Set a new password"} using this link: ${link}\n\nThis link expires at ${expiresAt.toISOString()}.`,
    });
  } catch (error) {
    logger.error("auth.token.delivery_failed", { purpose, userId: user.id, error });
  }
}

async function consumeToken(token: string, purpose: AuthTokenPurpose) {
  const tokenHash = hashToken(token);
  return prisma.$transaction(async (tx) => {
    const record = await tx.authToken.findFirst({ where: { tokenHash, purpose, usedAt: null, expiresAt: { gt: new Date() } } });
    if (!record) return null;
    const consumed = await tx.authToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
    return consumed.count === 1 ? record : null;
  });
}

export async function verifyEmail(token: string) {
  const record = await consumeToken(token, "EMAIL_VERIFICATION");
  if (!record) return false;
  await prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
  return true;
}

export async function resetPassword(token: string, password: string) {
  const record = await consumeToken(token, "PASSWORD_RESET");
  if (!record) return false;
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: passwordHash } }),
    prisma.authSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  return true;
}
