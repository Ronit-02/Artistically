import type { QueryClient } from "@tanstack/react-query";

const IDENTITY_QUERY_ROOTS = [
  ["auth"],
  ["cart"],
  ["wishlist"],
  ["orders"],
  ["seller-orders"],
  ["seller-reviews"],
  ["products"],
] as const;

export function clearIdentityQueries(queryClient: QueryClient) {
  for (const queryKey of IDENTITY_QUERY_ROOTS) {
    queryClient.removeQueries({ queryKey });
  }
}
