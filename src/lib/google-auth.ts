import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";

const GOOGLE_PROVIDER = "google";
const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_STATE_COOKIE = "artistically_google_oauth";
const OAUTH_STATE_TTL_SECONDS = 10 * 60;

type OAuthState = { state: string; nonce: string; codeVerifier: string };
type GoogleProfile = { subject: string; email: string; firstName: string; lastName: string };

export class GoogleAuthError extends Error {
  constructor() {
    super("Google sign-in could not be completed");
    this.name = "GoogleAuthError";
  }
}

function redirectUri() {
  return new URL("/api/auth/google/callback", serverEnv.NEXT_PUBLIC_APP_URL).toString();
}

function randomValue() {
  return randomBytes(32).toString("base64url");
}

function codeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function isConfigured() {
  return Boolean(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET);
}

function parseState(value: string | undefined): OAuthState | null {
  if (!value) { return null; }
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null) { return null; }
    const { state, nonce, codeVerifier } = parsed as Record<string, unknown>;
    return typeof state === "string" && typeof nonce === "string" && typeof codeVerifier === "string"
      ? { state, nonce, codeVerifier }
      : null;
  } catch { return null; }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: OAUTH_STATE_TTL_SECONDS,
    path: "/",
  };
}

export function beginGoogleAuthorization() {
  if (!isConfigured()) { throw new GoogleAuthError(); }
  const oauthState: OAuthState = { state: randomValue(), nonce: randomValue(), codeVerifier: randomValue() };
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", serverEnv.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", oauthState.state);
  url.searchParams.set("nonce", oauthState.nonce);
  url.searchParams.set("code_challenge", codeChallenge(oauthState.codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");
  return { url: url.toString(), state: JSON.stringify(oauthState), cookieOptions: cookieOptions() };
}

async function exchangeCode(code: string, codeVerifier: string) {
  const body = new URLSearchParams({
    code,
    client_id: serverEnv.GOOGLE_CLIENT_ID!,
    client_secret: serverEnv.GOOGLE_CLIENT_SECRET!,
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok || typeof payload !== "object" || payload === null || typeof (payload as Record<string, unknown>).id_token !== "string") {
    throw new GoogleAuthError();
  }
  return (payload as { id_token: string }).id_token;
}

async function verifyIdToken(idToken: string, nonce: string): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    audience: serverEnv.GOOGLE_CLIENT_ID!,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  if (typeof payload.sub !== "string" || typeof payload.email !== "string" || payload.email_verified !== true || payload.nonce !== nonce) {
    throw new GoogleAuthError();
  }
  const nameParts = typeof payload.name === "string" ? payload.name.trim().split(/\s+/) : [];
  const firstName = typeof payload.given_name === "string" && payload.given_name.trim() ? payload.given_name.trim() : nameParts[0] || "Google";
  const lastName = typeof payload.family_name === "string" && payload.family_name.trim() ? payload.family_name.trim() : nameParts.slice(1).join(" ") || "User";
  return { subject: payload.sub, email: payload.email.toLowerCase(), firstName, lastName };
}

async function findOrCreateUser(profile: GoogleProfile) {
  const existingIdentity = await prisma.authIdentity.findUnique({
    where: { provider_providerSubject: { provider: GOOGLE_PROVIDER, providerSubject: profile.subject } },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } } },
  });
  if (existingIdentity) {
    if (!existingIdentity.user.isActive) { throw new GoogleAuthError(); }
    return existingIdentity.user;
  }

  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { email: profile.email } });
    const user = existingUser ?? await tx.user.create({
      data: { email: profile.email, password: null, firstName: profile.firstName, lastName: profile.lastName, emailVerifiedAt: new Date() },
    });
    if (!user.isActive) { throw new GoogleAuthError(); }
    await tx.authIdentity.create({ data: { userId: user.id, provider: GOOGLE_PROVIDER, providerSubject: profile.subject } });
    if (!user.emailVerifiedAt) {
      await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    }
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive };
  });
}

export async function completeGoogleAuthorization(request: NextRequest) {
  if (!isConfigured()) { throw new GoogleAuthError(); }
  const state = parseState(request.cookies.get(GOOGLE_STATE_COOKIE)?.value);
  const returnedState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  if (!state || !returnedState || state.state !== returnedState || !code) { throw new GoogleAuthError(); }
  return findOrCreateUser(await verifyIdToken(await exchangeCode(code, state.codeVerifier), state.nonce));
}

export const googleAuthCookie = { name: GOOGLE_STATE_COOKIE, options: cookieOptions };
