// ─────────────────────────────────────────────────────────────────────────────
// proxy.ts  (Next.js request proxy — runs before every matched request)
// Protects routes that require authentication at the edge level
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  getPageRouteAccess,
  isArtistApiMutation,
  isAdminRole,
  isAdminApiRoute,
  isArtistRole,
  isArtistApiRoute,
  isProtectedApiRoute,
} from "@/lib/route-access";

function getToken(req: NextRequest) {
  return (
    req.cookies.get("artistically_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "")
  );
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(url);
}

function redirectFromArtistPortal(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("error", "artist-access");
  return NextResponse.redirect(url);
}

function redirectFromAdmin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("error", "admin-access");
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const pageAccess = getPageRouteAccess(pathname);
  const isApiRequest = pathname.startsWith("/api/");
  const isProtected = isApiRequest && isProtectedApiRoute(pathname, req.method);
  const isArtistRoute = isApiRequest && isArtistApiMutation(pathname, req.method);
  const isAdminApi = isApiRequest && isAdminApiRoute(pathname);
  const isArtistApi = isApiRequest && isArtistApiRoute(pathname);

  if (pageAccess === "public" && !isProtected && !isArtistRoute) {
    return NextResponse.next();
  }

  const token = getToken(req);

  if (!token) {
    if (!isApiRequest) return redirectToLogin(req);

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

  if (pageAccess === "artist" && !isArtistRole(payload.role)) {
    return redirectFromArtistPortal(req);
  }

  if (pageAccess === "admin" && !isAdminRole(payload.role)) {
    return redirectFromAdmin(req);
  }

  if (isAdminApi && !isAdminRole(payload.role)) {
    return NextResponse.json(
      { success: false, error: "Administrator access required" },
      { status: 403 },
    );
  }

  if (isArtistApi && !isArtistRole(payload.role)) {
    return NextResponse.json(
      { success: false, error: "Artist access required" },
      { status: 403 },
    );
  }

  if (!isApiRequest) return NextResponse.next();

  // Forward user info to route handlers via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/api/:path*",
    "/profile",
    "/cart",
    "/wishlist",
    "/tracking",
    "/artist-portal",
    "/artist-portal/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
