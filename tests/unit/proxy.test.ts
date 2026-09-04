import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { signToken } from "@/lib/auth";

describe("request proxy", () => {
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
    const token = await signToken({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "collector@example.com",
      role: "USER",
    });
    const request = new NextRequest("https://artistically.example/artist-portal", {
      headers: { cookie: `artistically_token=${token}` },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://artistically.example/?error=artist-access",
    );
  });

  it("redirects authenticated non-admins away from the admin workspace", async () => {
    const token = await signToken({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "artist@example.com",
      role: "ARTIST",
    });
    const request = new NextRequest("https://artistically.example/admin/reports", {
      headers: { cookie: `artistically_token=${token}` },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://artistically.example/?error=admin-access",
    );
  });

  it("rejects authenticated non-admins at the admin API boundary", async () => {
    const token = await signToken({
      userId: "cmabcdefghijklmnopqrstuvwx",
      email: "artist@example.com",
      role: "ARTIST",
    });
    const response = await proxy(new NextRequest("https://artistically.example/api/admin/reports", {
      headers: { cookie: `artistically_token=${token}` },
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Administrator access required" });
  });
});
