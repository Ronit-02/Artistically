import { apiRequest } from "@/lib/api/client";
import { fromMinorUnits } from "@/lib/money";

export type CheckoutSessionDto = {
  id: string;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED";
  url: string | null;
};

export type CheckoutQuoteDto = {
  items: Array<{
    productId: string;
    quantity: number;
    size: string;
    unitPrice: number;
    stock: number;
    available: boolean;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  promoCode: string | null;
  canCheckout: boolean;
};

export async function fetchCheckoutQuote(promoCode?: string) {
  const quote = await apiRequest<CheckoutQuoteDto>("/api/checkout/quote", {
    method: "POST",
    body: JSON.stringify(promoCode ? { promoCode } : {}),
  });
  return {
    ...quote,
    items: quote.items.map((item) => ({ ...item, unitPrice: fromMinorUnits(item.unitPrice) })),
    subtotal: fromMinorUnits(quote.subtotal),
    shippingCost: fromMinorUnits(quote.shippingCost),
    tax: fromMinorUnits(quote.tax),
    discount: fromMinorUnits(quote.discount),
    total: fromMinorUnits(quote.total),
  };
}

export async function createCheckoutSession(input: {
  shippingAddress: string;
  idempotencyKey: string;
  promoCode?: string;
}) {
  return apiRequest<CheckoutSessionDto>("/api/checkout/session", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
