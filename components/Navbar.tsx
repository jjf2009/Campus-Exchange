"use client";

import Link from "next/link";
import {
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
import { LogoMark } from "@/components/brand";
import { APP_NAME } from "@/lib/constants";

export interface NavbarUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface NavbarProps {
  user?: NavbarUser | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur supports-backdrop-filter:bg-paper/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={user ? "/marketplace" : "/"}
          className="group flex items-center gap-2.5"
        >
          <LogoMark className="transition-transform group-hover:rotate-3" />
          <span className="hidden font-display text-lg font-extrabold tracking-tight sm:inline">
            {APP_NAME}
          </span>
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
              variant="lime"
              render={<Link href="/new-listing" />}
              nativeButton={false}
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">New Listing</span>
              <span className="sm:hidden">Sell</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-full border-2 border-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
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
          <Button variant="ink" render={<Link href="/login" />} nativeButton={false}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
