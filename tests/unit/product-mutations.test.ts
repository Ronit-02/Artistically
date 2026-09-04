import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api/client";
import { archiveProduct, createProduct, updateProduct } from "@/lib/api/products";

const productDto = {
  id: "cmabcdefghijklmnopqrstuvwx",
  title: "Quiet Study",
  description: null,
  price: 2400,
  originalPrice: null,
  discount: null,
  category: "PAINTINGS",
  badge: null,
  stock: 1,
  artist: { id: "cmhijklmnopqrstuvwxabcdef", handle: "@artist", verified: false, user: { firstName: "Ari", lastName: "Stone", avatar: null } },
  images: [{ url: "https://example.com/study.jpg", isPrimary: true, sortOrder: 0 }],
};

describe("artist product mutation adapters", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the existing product creation contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: productDto }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(createProduct({ title: "Quiet Study", price: 2400, category: "PAINTINGS", images: ["https://example.com/study.jpg"] })).resolves.toEqual(productDto);
    expect(fetchMock).toHaveBeenCalledWith("/api/products", expect.objectContaining({ method: "POST" }));
  });

  it("updates and archives through owner-protected product routes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: productDto }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(updateProduct(productDto.id, { title: "Updated Study" })).resolves.toEqual(productDto);
    await expect(archiveProduct(productDto.id)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenNthCalledWith(1, `/api/products/${productDto.id}`, expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, `/api/products/${productDto.id}`, expect.objectContaining({ method: "DELETE" }));
  });

  it("treats a successful 204 response as an empty result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiRequest<never>("/api/products/example", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
