import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotificationById,
  markAsRead,
} from "@/lib/notifications/notification-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await params;
  const notification = await getNotificationById(id, user.id);

  if (!notification) {
    return NextResponse.redirect(
      new URL("/dashboard/notifications", request.url)
    );
  }

  await markAsRead(id, user.id);

  const data = notification.data as { href?: string } | null;
  const target =
    typeof data?.href === "string" && data.href.length > 0
      ? data.href
      : "/dashboard/notifications";

  return NextResponse.redirect(new URL(target, request.url));
}
