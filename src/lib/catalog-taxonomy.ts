const SEARCH_TYPE_BY_CATEGORY_LABEL: Record<string, string> = {
  Paintings: "Painting",
  Sculptures: "Sculpture",
};

export const CATEGORY_LABELS = [
  "Paintings",
  "Digital Art",
  "Sculptures",
  "Glass Art",
  "Woodwork",
  "Ceramics",
] as const;

export const ART_TYPES: readonly string[] = [
  "Digital Art",
  "Photography",
  "Textile Design",
  "Painting",
  "Sculpture",
  "Ceramics",
  "Glass Art",
  "Woodwork",
];

export const PRICE_RANGES: readonly string[] = [
  "Under ₹500",
  "₹500 - ₹1,000",
  "₹1,000 - ₹2,000",
  "₹2,000 - ₹3,000",
  "Over ₹3,000",
];

export const PRICE_RANGE_MAP: Record<string, readonly [number, number]> = {
  "Under ₹500": [0, 499],
  "₹500 - ₹1,000": [500, 1000],
  "₹1,000 - ₹2,000": [1000, 2000],
  "₹2,000 - ₹3,000": [2000, 3000],
  "Over ₹3,000": [3000, Infinity],
};

export const API_CATEGORY_BY_LABEL: Record<string, string> = {
  Painting: "PAINTINGS",
  Sculpture: "SCULPTURES",
  Ceramics: "CERAMICS",
  "Digital Art": "DIGITAL_ART",
  "Glass Art": "GLASS_ART",
  Woodwork: "WOODWORK",
  Photography: "PHOTOGRAPHY",
  "Textile Design": "TEXTILE",
};

export function toSearchTypeLabel(categoryLabel: string): string {
  return SEARCH_TYPE_BY_CATEGORY_LABEL[categoryLabel] ?? categoryLabel;
}

export function toApiCategory(categoryLabel: string): string | undefined {
  return API_CATEGORY_BY_LABEL[toSearchTypeLabel(categoryLabel)];
}
