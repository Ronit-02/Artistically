import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn(), listForArtist: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));
vi.mock("@/lib/services/review.service", () => ({ reviewService: { listForArtist: mocks.listForArtist } }));

import { GET } from "@/app/api/artist/reviews/route";

describe("seller review route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-1", role: "ARTIST" });
    mocks.listForArtist.mockResolvedValue([]);
  });

  it("lists reviews through the artist-scoped service", async () => {
    const response = await GET(new NextRequest("https://artistically.example/api/artist/reviews"));

    expect(response.status).toBe(200);
    expect(mocks.listForArtist).toHaveBeenCalledWith("artist-1");
  });

  it("rejects collectors", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "collector-1", role: "USER" });
    const response = await GET(new NextRequest("https://artistically.example/api/artist/reviews"));

    expect(response.status).toBe(403);
    expect(mocks.listForArtist).not.toHaveBeenCalled();
  });
});
