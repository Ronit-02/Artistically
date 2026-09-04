// ─────────────────────────────────────────────────────────────────────────────
// lib/auth.ts
// JWT signing/verification + cookie helpers
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";

const SECRET = new TextEncoder().encode(
  serverEnv.JWT_SECRET ?? "artistically-local-development-secret-only"
);

const COOKIE_NAME = "artistically_token";
const TOKEN_EXPIRY = "7d";

// ─── Token payload ───────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ─── Sign ────────────────────────────────────────────────────────────────────

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

// ─── Verify ──────────────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Set cookie ──────────────────────────────────────────────────────────────

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// ─── Clear cookie ─────────────────────────────────────────────────────────────

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Get current user from request ───────────────────────────────────────────

export async function getAuthUser(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  return verifyToken(token);
}

// ─── Require auth — use in route handlers ────────────────────────────────────

export async function requireAuth(
  req: NextRequest
): Promise<TokenPayload> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
