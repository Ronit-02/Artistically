import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  productUpdate: vi.fn(),
  productDelete: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { artist: { findUnique: mocks.artistFindUnique } },
}));

vi.mock("@/lib/services/product.service", () => ({
  productService: {
    update: mocks.productUpdate,
    delete: mocks.productDelete,
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {},
}));

import { PATCH, DELETE } from "@/app/api/products/[id]/route";

const productId = "cmabcdefghijklmnopqrstuvwx";
const artistId = "cmhijklmnopqrstuvwxabcdef";
const context = { params: Promise.resolve({ id: productId }) };
const request = (method: "PATCH" | "DELETE", body?: unknown) => new NextRequest(
  `https://artistically.example/api/products/${productId}`,
  {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "content-type": "application/json" } }),
  },
);

describe("product mutation route authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.artistFindUnique.mockResolvedValue({ id: artistId, userId: "artist-user" });
  });

  it("forbids product updates from users without an artist profile", async () => {
    mocks.artistFindUnique.mockResolvedValueOnce(null);

    const response = await PATCH(request("PATCH", { title: "Updated artwork" }), context);

    expect(response.status).toBe(403);
    expect(mocks.productUpdate).not.toHaveBeenCalled();
  });

  it("passes validated owner-scoped updates to the product service", async () => {
    const updated = { id: productId, title: "Updated artwork" };
    mocks.productUpdate.mockResolvedValueOnce(updated);

    const response = await PATCH(request("PATCH", { title: "Updated artwork" }), context);

    expect(response.status).toBe(200);
    expect(mocks.productUpdate).toHaveBeenCalledWith(productId, artistId, { title: "Updated artwork" });
    await expect(response.json()).resolves.toMatchObject({ success: true, data: updated });
  });

  it("does not reveal or mutate another artist’s product", async () => {
    mocks.productUpdate.mockResolvedValueOnce(null);

    const response = await PATCH(request("PATCH", { title: "Attempted takeover" }), context);

    expect(response.status).toBe(404);
    expect(mocks.productUpdate).toHaveBeenCalledWith(productId, artistId, { title: "Attempted takeover" });
  });

  it("returns 204 after an owner-scoped archive", async () => {
    mocks.productDelete.mockResolvedValueOnce(true);

    const response = await DELETE(request("DELETE"), context);

    expect(response.status).toBe(204);
    expect(mocks.productDelete).toHaveBeenCalledWith(productId, artistId);
  });

  it("returns not found when the owner-scoped archive target is absent", async () => {
    mocks.productDelete.mockResolvedValueOnce(false);

    const response = await DELETE(request("DELETE"), context);

    expect(response.status).toBe(404);
  });
});
