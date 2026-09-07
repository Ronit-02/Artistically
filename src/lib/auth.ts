import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";
import { enforceRateLimit, opaqueRateLimitKey } from "@/lib/rate-limit";

const ACCESS_COOKIE_NAME = "artistically_access";
const REFRESH_COOKIE_NAME = "artistically_refresh";
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
const TOKEN_ALGORITHM = "HS256";
const TOKEN_PURPOSE = "access";
const secret = new TextEncoder().encode(serverEnv.JWT_SECRET);

export interface TokenPayload { userId: string; email: string; role: string; sessionId: string; }

function hashRefreshToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
function refreshToken() { return randomBytes(48).toString("base64url"); }

async function signAccessToken(payload: TokenPayload) {
  return new SignJWT({ email: payload.email, role: payload.role, purpose: TOKEN_PURPOSE })
    .setProtectedHeader({ alg: TOKEN_ALGORITHM, typ: "JWT" })
    .setIssuer(serverEnv.AUTH_TOKEN_ISSUER)
    .setAudience(serverEnv.AUTH_TOKEN_AUDIENCE)
    .setSubject(payload.userId).setJti(payload.sessionId).setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRY_SECONDS}s`).sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload, protectedHeader } = await jwtVerify(token, secret, { algorithms: [TOKEN_ALGORITHM], issuer: serverEnv.AUTH_TOKEN_ISSUER, audience: serverEnv.AUTH_TOKEN_AUDIENCE });
    if (protectedHeader.alg !== TOKEN_ALGORITHM || payload.purpose !== TOKEN_PURPOSE || typeof payload.sub !== "string" || typeof payload.jti !== "string" || typeof payload.email !== "string" || typeof payload.role !== "string") {return null;}
    return { userId: payload.sub, sessionId: payload.jti, email: payload.email, role: payload.role };
  } catch { return null; }
}

function cookieOptions(maxAge: number) { return { httpOnly: true, secure: serverEnv.NODE_ENV === "production", sameSite: "lax" as const, maxAge, path: "/" }; }

async function setSessionCookies(accessToken: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, cookieOptions(ACCESS_TOKEN_EXPIRY_SECONDS));
  cookieStore.set(REFRESH_COOKIE_NAME, refresh, cookieOptions(REFRESH_TOKEN_EXPIRY_SECONDS));
}

async function setAccessCookie(accessToken: string) { (await cookies()).set(ACCESS_COOKIE_NAME, accessToken, cookieOptions(ACCESS_TOKEN_EXPIRY_SECONDS)); }

export async function createAuthSession(user: { id: string; email: string; role: string }) {
  const refresh = refreshToken();
  const session = await prisma.authSession.create({ data: { userId: user.id, refreshTokenHash: hashRefreshToken(refresh), expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000) } });
  await setSessionCookies(await signAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id }), refresh);
}

export async function refreshAccessToken(user: TokenPayload) {
  await setAccessCookie(await signAccessToken(user));
}

export async function rotateAuthSession() {
  const cookieStore = await cookies();
  const current = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!current) {throw new AuthError();}
  const currentHash = hashRefreshToken(current);
  const session = await prisma.authSession.findFirst({ where: { refreshTokenHash: currentHash, revokedAt: null, expiresAt: { gt: new Date() }, user: { isActive: true } }, include: { user: { select: { id: true, email: true, role: true } } } });
  if (!session) {throw new AuthError();}
  const next = refreshToken();
  const replacement = await prisma.$transaction(async (tx) => {
    const created = await tx.authSession.create({ data: { userId: session.userId, refreshTokenHash: hashRefreshToken(next), expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000) } });
    const revoked = await tx.authSession.updateMany({ where: { id: session.id, refreshTokenHash: currentHash, revokedAt: null }, data: { revokedAt: new Date(), replacedById: created.id, lastUsedAt: new Date() } });
    if (revoked.count !== 1) {throw new AuthError();}
    return created;
  });
  await setSessionCookies(await signAccessToken({ userId: session.user.id, email: session.user.email, role: session.user.role, sessionId: replacement.id }), next);
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (refresh) {await prisma.authSession.updateMany({ where: { refreshTokenHash: hashRefreshToken(refresh), revokedAt: null }, data: { revokedAt: new Date() } });}
  cookieStore.delete(ACCESS_COOKIE_NAME); cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {return null;}
  const payload = await verifyToken(token);
  if (!payload) {return null;}
  const active = await prisma.authSession.findFirst({ where: { id: payload.sessionId, userId: payload.userId, revokedAt: null, expiresAt: { gt: new Date() }, user: { isActive: true } }, select: { user: { select: { email: true, role: true } } } });
  return active ? { ...payload, email: active.user.email, role: active.user.role } : null;
}

export async function requireAuth(req: NextRequest): Promise<TokenPayload> {
  const user = await getAuthUser(req);
  if (!user) {throw new AuthError();}
  await enforceRateLimit(opaqueRateLimitKey("authenticated", user.sessionId), { max: 600, windowMs: 60_000 });
  return user;
}
export class AuthError extends Error { constructor() { super("Authentication required"); this.name = "AuthError"; } }
export const authCookieNames = { access: ACCESS_COOKIE_NAME, refresh: REFRESH_COOKIE_NAME };
