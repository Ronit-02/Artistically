import { apiRequest } from "@/lib/api/client";

export type NotificationDto = { id: string; kind: string; title: string; body: string; href: string | null; readAt: string | null; createdAt: string };
export type NotificationsResponse = { notifications: NotificationDto[]; unreadCount: number };

export function fetchNotifications() { return apiRequest<NotificationsResponse>("/api/notifications"); }
export function markNotificationRead(id: string) { return apiRequest<{ updated: number }>("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) }); }
export function markAllNotificationsRead() { return apiRequest<{ updated: number }>("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) }); }
