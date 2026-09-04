import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "@/lib/api/wishlist";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  forUser: (userId: string) => ["wishlist", userId] as const,
};

export function useWishlist() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: wishlistKeys.forUser(currentUser?.id ?? "anonymous"),
    queryFn: fetchWishlist,
    enabled: !!currentUser,
  });

  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useWishlistMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all });

  return {
    add: useMutation({ mutationFn: addToWishlist, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: removeFromWishlist, onSuccess: invalidate }),
  };
}
