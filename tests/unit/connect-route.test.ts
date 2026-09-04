import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn(), createOnboardingLink: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/connect.service", () => ({ connectService: { createOnboardingLink: mocks.createOnboardingLink } }));

import { POST } from "@/app/api/artist/connect/route";

function request(body: unknown) {
  return new NextRequest("https://artistically.example/api/artist/connect", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("Stripe Connect route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user-1", role: "ARTIST" });
    mocks.createOnboardingLink.mockResolvedValue({ url: "https://connect.stripe.test/onboard", stripeAccountId: "acct_1" });
  });

  it("creates an owner-scoped onboarding link", async () => {
    const response = await POST(request({
      returnUrl: "https://artistically.example/artist-portal?tab=settings",
      refreshUrl: "https://artistically.example/artist-portal?tab=settings&refresh=1",
    }));

    expect(response.status).toBe(200);
    expect(mocks.createOnboardingLink).toHaveBeenCalledWith("artist-user-1", {
      returnUrl: "https://artistically.example/artist-portal?tab=settings",
      refreshUrl: "https://artistically.example/artist-portal?tab=settings&refresh=1",
    });
  });

  it("rejects buyers", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    const response = await POST(request({
      returnUrl: "https://artistically.example/artist-portal",
      refreshUrl: "https://artistically.example/artist-portal",
    }));

    expect(response.status).toBe(403);
    expect(mocks.createOnboardingLink).not.toHaveBeenCalled();
  });
});
