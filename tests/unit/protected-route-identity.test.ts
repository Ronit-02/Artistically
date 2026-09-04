import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: { userId: "user-a", role: "USER" as string },
  requireAuth: vi.fn(),
  cartFindMany: vi.fn(),
  cartFindFirst: vi.fn(),
  cartUpdate: vi.fn(),
  wishlistFindMany: vi.fn(),
  orderListForUser: vi.fn(),
  orderGetById: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
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
    cartItem: {
      findMany: mocks.cartFindMany,
      findFirst: mocks.cartFindFirst,
      update: mocks.cartUpdate,
    },
    wishlistItem: { findMany: mocks.wishlistFindMany },
    user: { findUnique: mocks.userFindUnique, update: mocks.userUpdate },
  },
}));

vi.mock("@/lib/services/order.service", () => ({
  orderService: {
    listForUser: mocks.orderListForUser,
    getById: mocks.orderGetById,
  },
}));

import { GET as getCart } from "@/app/api/cart/route";
import { PATCH as patchCartItem } from "@/app/api/cart/[itemId]/route";
import { GET as getWishlist } from "@/app/api/wishlist/route";
import { GET as getOrders } from "@/app/api/orders/route";
import { GET as getOrder } from "@/app/api/orders/[id]/route";
import { GET as getUser, PATCH as patchUser } from "@/app/api/users/[id]/route";

const validId = "cmabcdefghijklmnopqrstuvwx";

function request(path: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
  return new NextRequest(`https://artistically.example${path}`, init);
}

describe("protected route identity boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.userId = "user-a";
    mocks.auth.role = "USER";
    mocks.requireAuth.mockImplementation(async () => mocks.auth);
    mocks.cartFindMany.mockResolvedValue([]);
    mocks.wishlistFindMany.mockResolvedValue([]);
    mocks.orderListForUser.mockResolvedValue([]);
    mocks.orderGetById.mockResolvedValue(null);
    mocks.userFindUnique.mockResolvedValue({ id: validId });
    mocks.userUpdate.mockResolvedValue({ id: validId, firstName: "Updated" });
  });

  it("scopes cart and wishlist reads to the authenticated user", async () => {
    await getCart(request("/api/cart"));
    await getWishlist(request("/api/wishlist"));

    expect(mocks.cartFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-a" } }));
    expect(mocks.wishlistFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-a" } }));

    mocks.auth.userId = "user-b";
    await getCart(request("/api/cart"));
    await getWishlist(request("/api/wishlist"));

    expect(mocks.cartFindMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { userId: "user-b" } }));
    expect(mocks.wishlistFindMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { userId: "user-b" } }));
  });

  it("does not update a cart item owned by another user", async () => {
    mocks.cartFindFirst.mockResolvedValue(null);

    const response = await patchCartItem(
      request(`/api/cart/${validId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: 2 }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ itemId: validId }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.cartFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: validId, userId: "user-a" },
    }));
    expect(mocks.cartUpdate).not.toHaveBeenCalled();
  });

  it("passes the authenticated user to order list and detail reads", async () => {
    await getOrders(request("/api/orders"));
    await getOrder(request(`/api/orders/${validId}`), { params: Promise.resolve({ id: validId }) });

    expect(mocks.orderListForUser).toHaveBeenCalledWith("user-a");
    expect(mocks.orderGetById).toHaveBeenCalledWith(validId, "user-a");

    mocks.auth.userId = "user-b";
    await getOrder(request(`/api/orders/${validId}`), { params: Promise.resolve({ id: validId }) });
    expect(mocks.orderGetById).toHaveBeenLastCalledWith(validId, "user-b");
  });

  it("forbids cross-user profile reads while allowing administrators to inspect them", async () => {
    mocks.auth.userId = "user-a";
    mocks.auth.role = "USER";
    const forbiddenResponse = await getUser(
      request(`/api/users/${validId}`),
      { params: Promise.resolve({ id: validId }) },
    );
    expect(forbiddenResponse.status).toBe(403);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();

    mocks.auth.role = "ADMIN";
    const adminResponse = await getUser(
      request(`/api/users/${validId}`),
      { params: Promise.resolve({ id: validId }) },
    );
    expect(adminResponse.status).toBe(200);
    expect(mocks.userFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: validId } }));
  });

  it("forbids cross-user profile updates and scopes own updates to the authenticated user", async () => {
    const body = JSON.stringify({ firstName: "Updated" });
    const forbiddenResponse = await patchUser(
      request(`/api/users/${validId}`, {
        method: "PATCH",
        body,
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: validId }) },
    );

    expect(forbiddenResponse.status).toBe(403);
    expect(mocks.userUpdate).not.toHaveBeenCalled();

    mocks.auth.userId = validId;
    const ownResponse = await patchUser(
      request(`/api/users/${validId}`, {
        method: "PATCH",
        body,
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: validId }) },
    );

    expect(ownResponse.status).toBe(200);
    expect(mocks.userUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: validId },
      data: { firstName: "Updated" },
    }));
  });
});
