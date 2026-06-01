// ─────────────────────────────────────────────────────────────────────────────
// middleware.ts  (Next.js edge middleware — runs before every matched request)
// Protects routes that require authentication at the edge level
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that require a valid token
const PROTECTED_ROUTES = [
  "/api/cart",
  "/api/orders",
  "/api/wishlist",
  "/api/auth/me",
  "/api/users",
];

// Routes that require ARTIST or ADMIN role
const ARTIST_ROUTES = ["/api/artists"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isArtistRoute =
    ARTIST_ROUTES.some((r) => pathname.startsWith(r)) &&
    req.method === "POST";

  if (!isProtected && !isArtistRoute) {
    return NextResponse.next();
  }

  // Extract token from cookie or Authorization header
  const token =
    req.cookies.get("artistically_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Forward user info to route handlers via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*"],
};
