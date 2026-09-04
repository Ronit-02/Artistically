import { NextRequest } from "next/server";
import { ok, withErrorHandler } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import { z } from "zod";

const NotificationMutationSchema = z.object({ id: z.string().cuid().optional(), all: z.boolean().optional() }).strict();

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const [notifications, unreadCount] = await Promise.all([notificationService.listForUser(user.userId), notificationService.unreadCount(user.userId)]);
  return ok({ notifications, unreadCount });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const body = NotificationMutationSchema.parse(await request.json());
  if (body.all) return ok({ updated: (await notificationService.markAllRead(user.userId)).count });
  if (!body.id) return ok({ updated: 0 });
  return ok({ updated: (await notificationService.markRead(body.id, user.userId)) ? 1 : 0 });
});
