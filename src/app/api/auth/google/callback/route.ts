import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createAuthSession } from "@/lib/auth";
import { completeGoogleAuthorization, googleAuthCookie } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await completeGoogleAuthorization(request);
    await createAuthSession(user);
    const destination = user.role === "ARTIST" ? "/artist-portal" : "/";
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.delete(googleAuthCookie.name);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login?error=google", request.url));
    response.cookies.delete(googleAuthCookie.name);
    return response;
  }
}
