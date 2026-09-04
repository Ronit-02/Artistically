import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn(), quote: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));
vi.mock("@/lib/services/order.service", () => ({ orderService: { quote: mocks.quote } }));

import { POST } from "@/app/api/checkout/quote/route";

describe("checkout quote route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "collector-1", role: "USER" });
    mocks.quote.mockResolvedValue({ subtotal: 100, total: 312, canCheckout: true });
  });

  it("returns an authoritative quote without creating an order", async () => {
    const response = await POST(new NextRequest("https://artistically.example/api/checkout/quote", {
      method: "POST",
      body: JSON.stringify({ promoCode: " art10 " }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(200);
    expect(mocks.quote).toHaveBeenCalledWith("collector-1", " art10 ");
    await expect(response.json()).resolves.toMatchObject({ data: { canCheckout: true } });
  });
});
