import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  listForUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/order.service", () => ({
  orderService: { listForUser: mocks.listForUser },
}));

import { GET, POST } from "@/app/api/orders/route";

function request(method: "GET" | "POST") {
  return new NextRequest("https://artistically.example/api/orders", { method });
}

describe("order collection routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    mocks.listForUser.mockResolvedValue([]);
  });

  it("lists the authenticated buyer's orders", async () => {
    const response = await GET(request("GET"));

    expect(response.status).toBe(200);
    expect(mocks.listForUser).toHaveBeenCalledWith("buyer-1");
  });

  it("rejects the retired direct order-creation mutation", async () => {
    const response = await POST(request("POST"));

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      success: false,
      error: "Orders are created after verified payment checkout; use /api/checkout/session",
    });
  });
});
