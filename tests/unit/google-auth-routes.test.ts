import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  beginGoogleAuthorization: vi.fn(),
  completeGoogleAuthorization: vi.fn(),
  createAuthSession: vi.fn(),
}));

vi.mock("@/lib/google-auth", () => ({
  beginGoogleAuthorization: mocks.beginGoogleAuthorization,
  completeGoogleAuthorization: mocks.completeGoogleAuthorization,
  googleAuthCookie: { name: "artistically_google_oauth" },
}));

vi.mock("@/lib/auth", () => ({ createAuthSession: mocks.createAuthSession }));

import { GET as begin } from "@/app/api/auth/google/route";
import { GET as callback } from "@/app/api/auth/google/callback/route";

describe("Google authentication routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createAuthSession.mockResolvedValue(undefined);
  });

  it("redirects to Google and stores a short-lived OAuth state cookie", async () => {
    mocks.beginGoogleAuthorization.mockReturnValue({
      url: "https://accounts.google.com/o/oauth2/v2/auth?state=state",
      state: "serialized-state",
      cookieOptions: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 },
    });

    const response = await begin(new NextRequest("http://localhost:3001/api/auth/google"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("accounts.google.com");
    expect(response.headers.get("set-cookie")).toContain("artistically_google_oauth=serialized-state");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("creates the existing session and returns a collector home after a verified callback", async () => {
    mocks.completeGoogleAuthorization.mockResolvedValue({ id: "user-1", email: "collector@example.com", role: "USER" });

    const response = await callback(new NextRequest("http://localhost:3001/api/auth/google/callback?code=code&state=state"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3001/");
    expect(mocks.createAuthSession).toHaveBeenCalledWith(expect.objectContaining({ id: "user-1" }));
    expect(response.headers.get("set-cookie")).toContain("artistically_google_oauth=;");
  });

  it("clears OAuth state and returns to login when callback verification fails", async () => {
    mocks.completeGoogleAuthorization.mockRejectedValue(new Error("invalid callback"));

    const response = await callback(new NextRequest("http://localhost:3001/api/auth/google/callback?error=access_denied"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3001/login?error=google");
    expect(mocks.createAuthSession).not.toHaveBeenCalled();
  });
});
