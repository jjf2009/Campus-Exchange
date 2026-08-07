import Link from "next/link";
import { ArrowLeft, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { requireCompleteProfile } from "@/lib/auth";
import {
  getNavbarNotifications,
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/notification-service";
import { formatRelativeDate } from "@/utils/formatDate";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireCompleteProfile();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [summary, notificationsResult, unreadCount] = await Promise.all([
    getNavbarNotifications(user.id),
    getNotifications(user.id, { limit, offset }),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={summary} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          render={<Link href="/dashboard" />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              Keep track of request updates and marketplace activity.
            </p>
          </div>

          <form action={markAllNotificationsReadAction}>
            <Button
              type="submit"
              variant="outline"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </form>
        </div>

        {notificationsResult.items.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Request updates, acceptances, and listing activity will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notificationsResult.items.map((notification) => (
              <Card
                key={notification.id}
                className={
                  notification.isRead ? "" : "border-primary/30 bg-primary/5"
                }
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>
                      {!notification.isRead ? (
                        <Badge variant="secondary">Unread</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={`/dashboard/notifications/${notification.id}`}
                        />
                      }
                      nativeButton={false}
                    >
                      Open
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                    {!notification.isRead ? (
                      <form
                        action={markNotificationReadAction.bind(
                          null,
                          notification.id
                        )}
                      >
                        <Button type="submit" size="sm">
                          Mark read
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/dashboard/notifications?page=${page - 1}`} />
              }
              nativeButton={false}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Page {page}</span>
          {notificationsResult.hasMore ? (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/dashboard/notifications?page=${page + 1}`} />
              }
              nativeButton={false}
            >
              Next
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
