import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  productGetById: vi.fn(),
  artistFindUnique: vi.fn(),
  userFindUnique: vi.fn(),
  storyFindFirst: vi.fn(),
}));

vi.mock("@/lib/services/product.service", () => ({
  productService: { getById: mocks.productGetById },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    user: { findUnique: mocks.userFindUnique },
    story: { findFirst: mocks.storyFindFirst },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-1", role: "USER" }),
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

import { GET as getProduct } from "@/app/api/products/[id]/route";
import { GET as getArtist } from "@/app/api/artists/[id]/route";
import { GET as getUser } from "@/app/api/users/[id]/route";
import { GET as getStory } from "@/app/api/stories/[id]/route";

describe("catalog route identifier boundaries", () => {
  it("rejects malformed product IDs before the service lookup", async () => {
    const response = await getProduct(
      new NextRequest("https://artistically.example/api/products/not-a-cuid"),
      { params: Promise.resolve({ id: "not-a-cuid" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.productGetById).not.toHaveBeenCalled();
  });

  it("rejects malformed artist IDs before the persistence lookup", async () => {
    const response = await getArtist(
      new NextRequest("https://artistically.example/api/artists/not-a-cuid"),
      { params: Promise.resolve({ id: "not-a-cuid" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.artistFindUnique).not.toHaveBeenCalled();
  });

  it("rejects malformed user IDs after auth and before the persistence lookup", async () => {
    const response = await getUser(
      new NextRequest("https://artistically.example/api/users/not-a-cuid"),
      { params: Promise.resolve({ id: "not-a-cuid" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("rejects malformed story IDs before the persistence lookup", async () => {
    const response = await getStory(
      new NextRequest("https://artistically.example/api/stories/not-a-cuid"),
      { params: Promise.resolve({ id: "not-a-cuid" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.storyFindFirst).not.toHaveBeenCalled();
  });
});
