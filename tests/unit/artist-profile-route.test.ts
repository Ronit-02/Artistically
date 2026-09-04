import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  artistUpdate: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: {
      findUnique: mocks.artistFindUnique,
      update: mocks.artistUpdate,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {},
}));

import { PATCH } from "@/app/api/artists/[id]/route";

const artistId = "cmabcdefghijklmnopqrstuvwx";
const request = (body: unknown) => new NextRequest(
  `https://artistically.example/api/artists/${artistId}`,
  { method: "PATCH", body: JSON.stringify(body), headers: { "content-type": "application/json" } },
);
const context = { params: Promise.resolve({ id: artistId }) };

describe("artist profile mutation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.artistFindUnique.mockResolvedValue({ id: artistId, userId: "artist-user" });
    mocks.artistUpdate.mockResolvedValue({ id: artistId, handle: "@updated", bio: "Updated", verified: false, user: { firstName: "Ari", lastName: "Stone", avatar: null } });
  });

  it("allows only the owning artist to update the profile", async () => {
    mocks.artistFindUnique.mockResolvedValueOnce({ id: artistId, userId: "another-user" });

    const response = await PATCH(request({ handle: "@updated" }), context);

    expect(response.status).toBe(403);
    expect(mocks.artistUpdate).not.toHaveBeenCalled();
  });

  it("validates and persists an owner profile update", async () => {
    const response = await PATCH(request({ handle: "@updated", bio: "Updated" }), context);

    expect(response.status).toBe(200);
    expect(mocks.artistUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: artistId },
      data: { handle: "@updated", bio: "Updated" },
    }));
  });

  it("rejects malformed handles before persistence", async () => {
    const response = await PATCH(request({ handle: "Not A Handle" }), context);

    expect(response.status).toBe(400);
    expect(mocks.artistUpdate).not.toHaveBeenCalled();
  });

  it("does not update a missing artist", async () => {
    mocks.artistFindUnique.mockResolvedValueOnce(null);

    const response = await PATCH(request({ bio: "Updated" }), context);

    expect(response.status).toBe(404);
    expect(mocks.artistUpdate).not.toHaveBeenCalled();
  });
});
