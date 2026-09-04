import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  createRefund: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/payment.service", () => ({
  paymentService: { createRefund: mocks.createRefund },
}));

import { POST } from "@/app/api/admin/orders/[id]/refund/route";

function request(body: unknown) {
  return new NextRequest("https://artistically.example/api/admin/orders/cm7q1k8l90000abcde1234567/refund", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("admin refund route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "admin-1", role: "ADMIN" });
    mocks.createRefund.mockResolvedValue({
      id: "refund-1",
      status: "SUCCEEDED",
      amount: 132000,
      currency: "inr",
      stripeRefundId: "re_1",
    });
  });

  it("requires an administrator and forwards the validated refund input", async () => {
    const response = await POST(request({ idempotencyKey: "refund-001" }), {
      params: Promise.resolve({ id: "cm7q1k8l90000abcde1234567" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.createRefund).toHaveBeenCalledWith("cm7q1k8l90000abcde1234567", {
      idempotencyKey: "refund-001",
    });
  });

  it("rejects non-administrator users", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });

    const response = await POST(request({ idempotencyKey: "refund-001" }), {
      params: Promise.resolve({ id: "cm7q1k8l90000abcde1234567" }),
    });

    expect(response.status).toBe(403);
    expect(mocks.createRefund).not.toHaveBeenCalled();
  });
});
