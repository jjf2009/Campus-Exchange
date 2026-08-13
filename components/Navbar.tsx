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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${APP_NAME} home`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-opacity group-hover:opacity-90">
            GEC
          </div>
          <span className="hidden font-semibold text-foreground sm:inline">
            {APP_NAME}
          </span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main navigation">
            {/* Marketplace link — desktop only */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
              render={<Link href="/" />}
              nativeButton={false}
            >
              <Store className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Marketplace
            </Button>

            {/* Sell CTA */}
            <Button
              size="sm"
              className="gap-1.5"
              render={<Link href="/new-listing" />}
              nativeButton={false}
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sell item</span>
              <span className="sm:hidden" aria-hidden="true">Sell</span>
            </Button>

            {/* Browser notifications */}
            <BrowserNotifications notifications={notifications} autoPrompt={true} />

            {/* Bell / notification dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  unreadCount > 0
                    ? `Notifications — ${unreadCount} unread`
                    : "Notifications"
                }
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unreadCount > 0 ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                    aria-hidden="true"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {unreadCount} new
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
                      className="items-start gap-3 py-3"
                    >
                      {/* Unread dot */}
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          !notification.isRead
                            ? "bg-primary"
                            : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {formatRelativeDate(notification.createdAt)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/dashboard/requests" />}
                  className="justify-center text-sm font-medium text-primary"
                >
                  View all requests
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-transparent transition-all hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.avatarUrl ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mobile marketplace link */}
                  <DropdownMenuItem
                    className="sm:hidden"
                    render={<Link href="/" />}
                  >
                    <Store className="mr-2 h-4 w-4" aria-hidden="true" />
                    Marketplace
                  </DropdownMenuItem>

                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                    <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="p-0 focus:bg-transparent">
                    <form action={signOut} className="w-full">
                      <button
                        type="submit"
                        className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="gap-2"
          >
            Continue with Google
          </Button>
        )}
      </div>
    </header>
  );
}
