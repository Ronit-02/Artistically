import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  addToCart,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart";

export const cartKeys = {
  all: ["cart"] as const,
  forUser: (userId: string) => ["cart", userId] as const,
};

export function useCart() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: cartKeys.forUser(currentUser?.id ?? "anonymous"),
    queryFn: fetchCart,
    enabled: !!currentUser,
  });

  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: cartKeys.all });

  return {
    add: useMutation({ mutationFn: addToCart, onSuccess: invalidate }),
    update: useMutation({ mutationFn: updateCartItem, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: removeCartItem, onSuccess: invalidate }),
    clear: useMutation({ mutationFn: clearCart, onSuccess: invalidate }),
  };
}
