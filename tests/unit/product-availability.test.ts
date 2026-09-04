import { describe, expect, it } from "vitest";
import { isProductSold } from "@/lib/product-availability";

describe("isProductSold", () => {
  it("marks zero and negative stock as sold", () => {
    expect(isProductSold(0)).toBe(true);
    expect(isProductSold(-1)).toBe(true);
  });

  it("keeps available and unknown stock unsold", () => {
    expect(isProductSold(1)).toBe(false);
    expect(isProductSold(undefined)).toBe(false);
  });
});
