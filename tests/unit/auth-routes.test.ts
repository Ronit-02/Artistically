import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userCreate: vi.fn(),
  compare: vi.fn(),
  hash: vi.fn(),
  signToken: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.userFindUnique, create: mocks.userCreate } },
}));

vi.mock("@/lib/auth", () => ({
  signToken: mocks.signToken,
  setAuthCookie: mocks.setAuthCookie,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: mocks.compare, hash: mocks.hash },
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";

describe("authentication routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signToken.mockResolvedValue("signed-token");
    mocks.setAuthCookie.mockResolvedValue(undefined);
    mocks.compare.mockResolvedValue(true);
    mocks.hash.mockResolvedValue("hashed-password");
  });

  it("sets the session cookie without returning the signed token on login", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      email: "collector@example.com",
      password: "stored-password",
      firstName: "Asha",
      lastName: "Rao",
      role: "USER",
      avatar: null,
    });

    const response = await login(
      new NextRequest("https://artistically.example/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "collector@example.com", password: "password123" }),
        headers: { "content-type": "application/json" },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.user).toMatchObject({ id: "user-1", email: "collector@example.com" });
    expect(payload.data).not.toHaveProperty("token");
    expect(mocks.signToken).toHaveBeenCalledOnce();
    expect(mocks.setAuthCookie).toHaveBeenCalledWith("signed-token");
  });

  it("sets the session cookie without returning the signed token on registration", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.userCreate.mockResolvedValue({
      id: "user-2",
      email: "new@example.com",
      firstName: "Neha",
      lastName: "Kapoor",
      role: "USER",
    });

    const response = await register(
      new NextRequest("https://artistically.example/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@example.com",
          password: "Password123",
          firstName: "Neha",
          lastName: "Kapoor",
        }),
        headers: { "content-type": "application/json" },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.user).toMatchObject({ id: "user-2", email: "new@example.com" });
    expect(payload.data).not.toHaveProperty("token");
    expect(mocks.signToken).toHaveBeenCalledOnce();
    expect(mocks.setAuthCookie).toHaveBeenCalledWith("signed-token");
  });
});
