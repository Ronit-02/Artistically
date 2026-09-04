"use client";

import Link from "next/link";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/useNotifications";

export default function NotificationBell() {
  const { data, isPending } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  if (isPending || !data) return null;
  return (
    <div className="relative group">
      <Link href="/profile?tab=notifications" aria-label={`Notifications${data.unreadCount ? `, ${data.unreadCount} unread` : ""}`} className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 hover:text-accent-600 transition-colors">
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        {data.unreadCount > 0 && <span className="absolute top-1 right-0 bg-accent-600 text-white text-[12px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-semibold">{data.unreadCount > 9 ? "9+" : data.unreadCount}</span>}
      </Link>
      <div className="invisible group-hover:visible group-focus-within:visible absolute right-0 top-full mt-1.5 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-3">
        <div className="flex items-center justify-between gap-3 px-1 pb-2"><p className="text-sm font-medium text-gray-900">Notifications</p>{data.unreadCount > 0 && <button type="button" onClick={() => markAll.mutate()} className="text-[12px] text-accent-600 hover:text-accent-700">Mark all read</button>}</div>
        {data.notifications.length === 0 ? <p className="px-1 py-5 text-sm text-gray-500">You’re all caught up.</p> : <div className="max-h-80 overflow-y-auto space-y-1">{data.notifications.slice(0, 6).map((notification) => <Link key={notification.id} href={notification.href ?? "/profile?tab=notifications"} onClick={() => { if (!notification.readAt) markRead.mutate(notification.id); }} className={`block rounded-lg px-3 py-2.5 hover:bg-accent-50 ${notification.readAt ? "" : "bg-accent-50"}`}><p className="text-[13px] font-medium text-gray-900">{notification.title}</p><p className="mt-0.5 text-[12px] text-gray-500 line-clamp-2">{notification.body}</p></Link>)}</div>}
      </div>
    </div>
  );
}
