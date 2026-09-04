import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  createCheckoutSession: vi.fn(),
  handleWebhook: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/payment.service", () => ({
  paymentService: {
    createCheckoutSession: mocks.createCheckoutSession,
    handleWebhook: mocks.handleWebhook,
  },
}));

import { POST as createSession } from "@/app/api/checkout/session/route";
import { POST as webhook } from "@/app/api/checkout/webhook/route";

function request(body: unknown, url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("payment checkout routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "buyer-1", role: "USER" });
    mocks.createCheckoutSession.mockResolvedValue({ id: "checkout-1", status: "PENDING", url: "https://checkout.stripe.test" });
    mocks.handleWebhook.mockResolvedValue({ received: true, handled: true });
  });

  it("creates a checkout session with the client idempotency key", async () => {
    const response = await createSession(request({
      shippingAddress: "12 Gallery Road, Mumbai, India",
      idempotencyKey: "buyer-checkout-001",
    }, "https://artistically.example/api/checkout/session"));

    expect(response.status).toBe(201);
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith("buyer-1", {
      shippingAddress: "12 Gallery Road, Mumbai, India",
      idempotencyKey: "buyer-checkout-001",
    });
  });

  it("passes the raw webhook body and Stripe signature to the service", async () => {
    const response = await webhook(request("{\"id\":\"evt_1\"}", "https://artistically.example/api/checkout/webhook", {
      "stripe-signature": "t=1,v1=signature",
    }));

    expect(response.status).toBe(200);
    expect(mocks.handleWebhook).toHaveBeenCalledWith("{\"id\":\"evt_1\"}", "t=1,v1=signature");
  });
});
