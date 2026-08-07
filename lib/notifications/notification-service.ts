import { and, desc, eq } from "drizzle-orm";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Resend } from "resend";
import { db } from "@/db";
import { notifications, type DbNotification } from "@/db/schema";
import { APP_NAME } from "@/lib/constants";
import type {
  NavbarNotificationSummary,
  NotificationData,
  NotificationType,
} from "@/types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getNotificationHref(notification: DbNotification) {
  const data = notification.data as NotificationData | null;
  if (data && typeof data.href === "string" && data.href.length > 0) {
    return data.href;
  }

  return "/dashboard/notifications";
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}) {
  const [created] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
      isRead: false,
      updatedAt: new Date(),
    })
    .returning({ id: notifications.id });

  return created;
}

export async function markAsRead(notificationId: string, userId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true, updatedAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning({ id: notifications.id });

  return updated ?? null;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true, updatedAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
}

export async function getUnreadNotificationCount(userId: string) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  return rows.length;
}

export async function getNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = rows.length > limit;

  return {
    items: rows.slice(0, limit),
    hasMore,
  };
}

export async function getNotificationById(
  notificationId: string,
  userId: string
) {
  const [row] = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function getNavbarNotifications(userId: string) {
  const [unreadCount, recent] = await Promise.all([
    getUnreadNotificationCount(userId),
    getNotifications(userId, { limit: 10 }),
  ]);

  const summary: NavbarNotificationSummary = {
    unreadCount,
    items: recent.items.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      href: getNotificationHref(notification),
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    })),
  };

  return summary;
}

export async function sendEmailNotification(params: {
  to: string;
  subject: string;
  element: ReactElement;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: params.to,
      subject: params.subject,
      html: renderToStaticMarkup(params.element),
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}
