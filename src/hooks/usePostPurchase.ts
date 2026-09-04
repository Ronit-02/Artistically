import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createOrderDispute, fetchOrderDeliveryRecords, fetchOrderDisputes, prepareDigitalDownload } from "@/lib/api/post-purchase";

export const postPurchaseKeys = {
  records: (userId: string, orderId: string) => ["delivery-records", userId, orderId] as const,
  disputes: (userId: string, orderId: string) => ["disputes", userId, orderId] as const,
};

export function usePrepareDigitalDownload(orderId: string) {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderItemId: string) => prepareDigitalDownload(orderId, orderItemId),
    onSuccess: () => {
      if (currentUser) queryClient.invalidateQueries({ queryKey: ["orders", currentUser.id, orderId] });
    },
  });
}

export function useOrderDeliveryRecords(orderId: string) {
  const { data: currentUser } = useCurrentUser();
  return useQuery({
    queryKey: postPurchaseKeys.records(currentUser?.id ?? "anonymous", orderId),
    queryFn: () => fetchOrderDeliveryRecords(orderId),
    enabled: !!currentUser && !!orderId,
  });
}

export function useOrderDisputes(orderId: string) {
  const { data: currentUser } = useCurrentUser();
  return useQuery({
    queryKey: postPurchaseKeys.disputes(currentUser?.id ?? "anonymous", orderId),
    queryFn: () => fetchOrderDisputes(orderId),
    enabled: !!currentUser && !!orderId,
  });
}

export function useCreateOrderDispute(orderId: string) {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: string; reason: string; orderItemId?: string }) => createOrderDispute(orderId, input),
    onSuccess: () => {
      if (!currentUser) return;
      queryClient.invalidateQueries({ queryKey: postPurchaseKeys.disputes(currentUser.id, orderId) });
      queryClient.invalidateQueries({ queryKey: postPurchaseKeys.records(currentUser.id, orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders", currentUser.id, orderId] });
    },
  });
}
