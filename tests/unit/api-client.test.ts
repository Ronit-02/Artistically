import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest, apiRequestPaginated } from "@/lib/api/client";

describe("API client validation errors", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserves structured field errors for form consumers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: "Validation failed",
      fields: {
        medium: ["Artwork medium is required"],
        width: ["Physical artwork must declare a width"],
      },
    }), { status: 400, headers: { "content-type": "application/json" } })));

    await expect(apiRequest("/api/products", { method: "POST", body: "{}" })).rejects.toMatchObject({
      name: "ApiClientError",
      status: 400,
      fields: {
        medium: ["Artwork medium is required"],
        width: ["Physical artwork must declare a width"],
      },
    } satisfies Partial<ApiClientError>);
  });

  it("returns pagination metadata for paginated endpoints", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: [{ id: "product-1" }],
      pagination: { total: 13, page: 2, limit: 12, totalPages: 2, hasNext: false, hasPrev: true },
    }), { status: 200, headers: { "content-type": "application/json" } })));

    await expect(apiRequestPaginated<{ id: string }>("/api/products?page=2&limit=12")).resolves.toEqual({
      data: [{ id: "product-1" }],
      pagination: { total: 13, page: 2, limit: 12, totalPages: 2, hasNext: false, hasPrev: true },
    });
  });

  it("rejects a successful paginated response without metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { status: 200 })));

    await expect(apiRequestPaginated("/api/products")).rejects.toMatchObject({ name: "ApiClientError", status: 200 });
  });
});
