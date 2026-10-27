import type { Product } from "@/types";

export function isProductSold(stock: number | undefined): boolean {
  return stock !== undefined && stock <= 0;
}

export function getProductBadge(
  product: Pick<Product, "stock" | "badge" | "artworkDetails">,
): "Sold" | "Limited edition" | null {
  // Museum reference records have no sale inventory and must not imply a sale.
  if (product.badge === "REFERENCE") {
    return null;
  }
  if (isProductSold(product.stock)) {
    return "Sold";
  }
  if (
    product.artworkDetails?.artworkType === "LIMITED_EDITION" &&
    (product.artworkDetails.editionSize ?? 0) > 0
  ) {
    return "Limited edition";
  }
  return null;
}
