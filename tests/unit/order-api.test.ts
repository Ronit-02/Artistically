import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiRequest: vi.fn() };
});

import { fetchOrderById } from "@/lib/api/orders";

const mockedApiRequest = vi.mocked(apiRequest);

const orderDto = {
  id: "cmabcdefghijklmnopqrstuvwx",
  status: "PROCESSING",
  createdAt: "2026-08-24T00:00:00.000Z",
  subtotal: 100000,
  shippingCost: 20000,
  tax: 12000,
  discount: 0,
  total: 132000,
  shippingAddress: "123 Main Street, Bengaluru",
  estimatedDelivery: null,
  items: [],
};

describe("order detail API mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the persisted order detail", async () => {
    mockedApiRequest.mockResolvedValueOnce(orderDto);

    await expect(fetchOrderById(orderDto.id)).resolves.toEqual({ ...orderDto, subtotal: 1000, shippingCost: 200, tax: 120, total: 1320 });
  });

  it("returns null only for a not-found response", async () => {
    mockedApiRequest.mockRejectedValueOnce(new ApiClientError("Not found", 404));

    await expect(fetchOrderById(orderDto.id)).resolves.toBeNull();
  });

  it("rethrows retryable API failures so tracking can offer retry", async () => {
    const error = new ApiClientError("Service unavailable", 503);
    mockedApiRequest.mockRejectedValueOnce(error);

    await expect(fetchOrderById(orderDto.id)).rejects.toBe(error);
  });
});
