import type { Prisma } from "@prisma/client";

// Non-sale museum references have no inventory, but are not sold listings.
export const BROWSE_PRODUCT_WHERE = {
  isActive: true,
  OR: [{ stock: { gt: 0 } }, { badge: "REFERENCE" }],
} satisfies Prisma.ProductWhereInput;
