import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";

export const notificationKeys = { all: ["notifications"] as const, forUser: (id: string) => ["notifications", id] as const };

export function useNotifications() {
  const { data: user } = useCurrentUser();
  return useQuery({ queryKey: notificationKeys.forUser(user?.id ?? "anonymous"), queryFn: fetchNotifications, enabled: !!user, refetchInterval: 60_000 });
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({ mutationFn: markNotificationRead, onSuccess: () => { if (user) client.invalidateQueries({ queryKey: notificationKeys.forUser(user.id) }); } });
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { if (user) client.invalidateQueries({ queryKey: notificationKeys.forUser(user.id) }); } });
}
