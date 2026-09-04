import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  artistFindUnique: vi.fn(),
  followFindUnique: vi.fn(),
  followUpsert: vi.fn(),
  followDeleteMany: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    follow: {
      findUnique: mocks.followFindUnique,
      upsert: mocks.followUpsert,
      deleteMany: mocks.followDeleteMany,
    },
  },
}));

import { DELETE, GET, POST } from "@/app/api/artists/[id]/follow/route";

const artistId = "cmabcdefghijklmnopqrstuvwx";

function request(method: string) {
  return new NextRequest(`https://artistically.example/api/artists/${artistId}/follow`, { method });
}

function context() {
  return { params: Promise.resolve({ id: artistId }) };
}

describe("artist follow route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "collector-1", role: "USER" });
    mocks.artistFindUnique.mockResolvedValue({ id: artistId });
    mocks.followFindUnique.mockResolvedValue(null);
    mocks.followUpsert.mockResolvedValue({ id: "follow-1" });
    mocks.followDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("returns the authenticated user's follow state", async () => {
    const response = await GET(request("GET"), context());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({ following: false });
    expect(mocks.followFindUnique).toHaveBeenCalledWith({
      where: { artistId_userId: { artistId, userId: "collector-1" } },
      select: { id: true },
    });
  });

  it("upserts a follow for the authenticated user", async () => {
    const response = await POST(request("POST"), context());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({ following: true });
    expect(mocks.followUpsert).toHaveBeenCalledWith({
      where: { artistId_userId: { artistId, userId: "collector-1" } },
      update: {},
      create: { artistId, userId: "collector-1" },
    });
  });

  it("deletes only the authenticated user's follow", async () => {
    const response = await DELETE(request("DELETE"), context());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({ following: false });
    expect(mocks.followDeleteMany).toHaveBeenCalledWith({
      where: { artistId, userId: "collector-1" },
    });
  });
});
