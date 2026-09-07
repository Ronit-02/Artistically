import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAuthUser: mocks.getAuthUser }));

import { proxy } from "@/proxy";

describe("request proxy", () => {
  beforeEach(() => { mocks.getAuthUser.mockResolvedValue(null); });
  it("requires an active server-side session rather than trusting a cookie payload", async () => {
    mocks.getAuthUser.mockResolvedValue(null);
    const response = await proxy(new NextRequest("https://artistically.example/profile", { headers: { cookie: "artistically_access=untrusted" } }));
    expect(response.status).toBe(307);
  });

  it("redirects unauthenticated protected pages to login with the original path", async () => {
    const request = new NextRequest("https://artistically.example/profile?tab=orders");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://artistically.example/login?next=%2Fprofile%3Ftab%3Dorders",
    );
  });

  it("keeps public pages available and returns API auth errors as JSON", async () => {
    const publicResponse = await proxy(new NextRequest("https://artistically.example/products/abc"));
    expect(publicResponse.status).toBe(200);

    const apiResponse = await proxy(new NextRequest("https://artistically.example/api/cart"));
    expect(apiResponse.status).toBe(401);
    await expect(apiResponse.json()).resolves.toMatchObject({
      success: false,
      error: "Authentication required",
    });

    const publicReviews = await proxy(
      new NextRequest("https://artistically.example/api/reviews?productId=product-1"),
    );
    expect(publicReviews.status).toBe(200);

    const reviewMutation = await proxy(
      new NextRequest("https://artistically.example/api/reviews", { method: "POST" }),
    );
    expect(reviewMutation.status).toBe(401);

    const reportMutation = await proxy(
      new NextRequest("https://artistically.example/api/reports", { method: "POST" }),
    );
    expect(reportMutation.status).toBe(401);

    const followStatus = await proxy(
      new NextRequest("https://artistically.example/api/artists/cmabcdefghijklmnopqrstuvwx/follow"),
    );
    expect(followStatus.status).toBe(401);
  });

  it("redirects authenticated collectors away from the artist workspace", async () => {
    mocks.getAuthUser.mockResolvedValue({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "collector@example.com",
      role: "USER",
      sessionId: "session-1",
    });
    const request = new NextRequest("https://artistically.example/artist-portal", {
      headers: { cookie: "artistically_access=server-validated" },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://artistically.example/?error=artist-access",
    );
  });

  it("redirects authenticated non-admins away from the admin workspace", async () => {
    mocks.getAuthUser.mockResolvedValue({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "artist@example.com",
      role: "ARTIST",
      sessionId: "session-1",
    });
    const request = new NextRequest("https://artistically.example/admin/reports", {
      headers: { cookie: "artistically_access=server-validated" },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://artistically.example/?error=admin-access",
    );
  });

  it("rejects authenticated non-admins at the admin API boundary", async () => {
    mocks.getAuthUser.mockResolvedValue({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "artist@example.com",
      role: "ARTIST",
      sessionId: "session-1",
    });
    const response = await proxy(new NextRequest("https://artistically.example/api/admin/reports", {
      headers: { cookie: "artistically_access=server-validated" },
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Administrator access required" });
  });
});
