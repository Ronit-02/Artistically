import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cancelOrder, createArtistPayout, fetchArtistSettlements, fetchOrderById, fetchOrderItems, fetchSellerOrders, publishDigitalDelivery, updateSellerOrderItemStatus } from "@/lib/api/orders";

export const orderKeys = {
  all: ["orders"] as const,
  forUser: (userId: string) => ["orders", userId] as const,
  detail: (userId: string, id: string) => ["orders", userId, id] as const,
};

export function useOrders() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: orderKeys.forUser(currentUser?.id ?? "anonymous"),
    queryFn: fetchOrderItems,
    enabled: !!currentUser,
  });

  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useOrder(orderId: string) {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: orderKeys.detail(currentUser?.id ?? "anonymous", orderId),
    queryFn: () => fetchOrderById(orderId),
    enabled: !!currentUser && !!orderId,
  });

  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useSellerOrders() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: ["seller-orders", currentUser?.id ?? "anonymous"],
    queryFn: fetchSellerOrders,
    enabled: !!currentUser && (currentUser.role === "ARTIST" || currentUser.role === "ADMIN"),
  });
  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useArtistSettlements() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const query = useQuery({
    queryKey: ["artist-settlements", currentUser?.id ?? "anonymous"],
    queryFn: fetchArtistSettlements,
    enabled: !!currentUser && (currentUser.role === "ARTIST" || currentUser.role === "ADMIN"),
  });
  return { ...query, data: currentUser ? query.data : undefined, currentUser, isAuthPending };
}

export function useCreateArtistPayout() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: ({ amountMinor, idempotencyKey }: { amountMinor: number; idempotencyKey: string }) => createArtistPayout(amountMinor, idempotencyKey),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["artist-settlements", currentUser?.id ?? "anonymous"] }); },
  });
}

export function useUpdateSellerOrderItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: Parameters<typeof updateSellerOrderItemStatus>[1] }) => updateSellerOrderItemStatus(itemId, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seller-orders"] }); },
  });
}

export function usePublishDigitalDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, assetReference, downloadLimit }: { itemId: string; assetReference: string; downloadLimit: number }) => publishDigitalDelivery(itemId, assetReference, downloadLimit),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seller-orders"] }); },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(currentUser.id, orderId) });
      }
    },
  });
}
