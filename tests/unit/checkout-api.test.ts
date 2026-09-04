import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({ apiRequest: vi.fn() }));

import { fetchCheckoutQuote } from "@/lib/api/checkout";

describe("checkout quote API adapter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the buyer promo code to the authoritative quote endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      subtotal: 100000,
      shippingCost: 20000,
      tax: 12000,
      discount: 10000,
      total: 122000,
      promoCode: "ART10",
      canCheckout: true,
      items: [],
    });

    await expect(fetchCheckoutQuote("art10")).resolves.toMatchObject({ discount: 100, total: 1220 });
    expect(apiRequest).toHaveBeenCalledWith("/api/checkout/quote", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ promoCode: "art10" }),
    }));
  });
});
