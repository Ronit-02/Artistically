import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { beginGoogleAuthorization } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const authorization = beginGoogleAuthorization();
    const response = NextResponse.redirect(authorization.url);
    response.cookies.set("artistically_google_oauth", authorization.state, authorization.cookieOptions);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google-unavailable", request.url));
  }
}
