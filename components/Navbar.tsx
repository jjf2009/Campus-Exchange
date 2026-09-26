"use client";

import Link from "next/link";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Store,
  UserRound,
} from "lucide-react";
import { signOut } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BrowserNotifications } from "@/components/BrowserNotifications";
import { formatRelativeDate } from "@/utils/formatDate";
import { APP_NAME } from "@/lib/constants";
import type { NavbarNotificationSummary } from "@/types";

export interface NavbarUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface NavbarProps {
  user?: NavbarUser | null;
  notifications?: NavbarNotificationSummary | null;
}

export function Navbar({ user, notifications }: NavbarProps) {
  const unreadCount = notifications?.unreadCount ?? 0;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={user ? "/marketplace" : "/"}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            GEC
          </div>
          <span className="hidden font-semibold sm:inline">{APP_NAME}</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/marketplace" />}
              nativeButton={false}
            >
              <Store className="mr-1.5 h-4 w-4" />
              Marketplace
            </Button>
            <Button
              size="sm"
              render={<Link href="/new-listing" />}
              nativeButton={false}
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">New Listing</span>
              <span className="sm:hidden">Sell</span>
            </Button>
            <BrowserNotifications
              notifications={notifications}
              autoPrompt={true}
            />

            <DropdownMenu>
              <DropdownMenuTrigger className="relative inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <Badge
                    variant="default"
                    className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        {unreadCount} unread
                      </span>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications?.items.length ? (
                  notifications.items.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      render={
                        <Link
                          href={`/dashboard/notifications/${notification.id}`}
                        />
                      }
                      className="items-start gap-3"
                    >
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary opacity-0 data-[read=false]:opacity-100" />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-1 font-medium">
                            {notification.title}
                          </span>
                          {!notification.isRead ? (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatRelativeDate(notification.createdAt)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/dashboard/requests" />}
                >
                  View interested buyers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.avatarUrl ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="sm:hidden"
                    render={<Link href="/marketplace" />}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Marketplace
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                    <UserRound className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-0 focus:bg-transparent">
                    <form action={signOut} className="w-full">
                      <button
                        type="submit"
                        className="flex w-full items-center rounded-md px-1.5 py-1 text-sm outline-none hover:bg-accent"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <Button render={<Link href="/login" />} nativeButton={false}>
            Continue with Google
          </Button>
        )}
      </div>
    </header>
  );
}
