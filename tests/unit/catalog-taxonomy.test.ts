import { describe, expect, it } from "vitest";
import {
  ART_TYPES,
  CATEGORY_LABELS,
  PRICE_RANGE_MAP,
  PRICE_RANGES,
  toApiCategory,
  toSearchTypeLabel,
} from "@/lib/catalog-taxonomy";

describe("catalog taxonomy navigation", () => {
  it("normalizes plural navigation labels to search filter labels", () => {
    expect(toSearchTypeLabel("Paintings")).toBe("Painting");
    expect(toSearchTypeLabel("Sculptures")).toBe("Sculpture");
    expect(toSearchTypeLabel("Ceramics")).toBe("Ceramics");
  });

  it("maps search labels to the existing API category values", () => {
    expect(toApiCategory("Paintings")).toBe("PAINTINGS");
    expect(toApiCategory("Digital Art")).toBe("DIGITAL_ART");
    expect(toApiCategory("Unknown")).toBeUndefined();
  });

  it("keeps every selectable art type on the persisted API taxonomy", () => {
    expect(ART_TYPES.every((label) => toApiCategory(label) !== undefined)).toBe(true);
  });

  it("keeps browse and filter labels in the API-owned taxonomy module", () => {
    expect(CATEGORY_LABELS).toContain("Paintings");
    expect(ART_TYPES).toContain("Digital Art");
    expect(PRICE_RANGES).toContain("Over ₹3,000");
    expect(PRICE_RANGE_MAP["Under ₹500"]).toEqual([0, 499]);
  });
});
