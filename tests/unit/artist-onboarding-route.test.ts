import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  artistCreate: vi.fn(),
  userUpdate: vi.fn(),
  transaction: vi.fn(),
  requireAuth: vi.fn(),
  signToken: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: {
      findUnique: mocks.artistFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/auth", () => ({
  AuthError: class AuthError extends Error {},
  requireAuth: mocks.requireAuth,
  signToken: mocks.signToken,
  setAuthCookie: mocks.setAuthCookie,
}));

import { POST } from "@/app/api/artists/route";

const request = (body: unknown) => new NextRequest(
  "https://artistically.example/api/artists",
  { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } },
);

describe("artist onboarding route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "USER" });
    mocks.artistFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mocks.artistCreate.mockResolvedValue({ id: "artist-id", handle: "@artist" });
    mocks.userUpdate.mockResolvedValue({ id: "artist-user", email: "artist@example.com", role: "ARTIST" });
    mocks.signToken.mockResolvedValue("signed-token");
    mocks.setAuthCookie.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      artist: { create: mocks.artistCreate },
      user: { update: mocks.userUpdate },
    }));
  });

  it("creates the artist profile and role promotion in one transaction", async () => {
    const response = await POST(request({ handle: "@artist", bio: "A short biography" }));

    expect(response.status).toBe(201);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.artistCreate).toHaveBeenCalledOnce();
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "artist-user" },
      data: { role: "ARTIST" },
      select: { id: true, email: true, role: true },
    });
    expect(mocks.signToken).toHaveBeenCalledWith({
      userId: "artist-user",
      email: "artist@example.com",
      role: "ARTIST",
    });
    expect(mocks.setAuthCookie).toHaveBeenCalledWith("signed-token");
  });
});
