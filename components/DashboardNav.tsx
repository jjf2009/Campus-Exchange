"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, Package, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/requests", label: "Requests", icon: Inbox },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-1 sm:flex-col sm:overflow-x-visible sm:pb-0"
      aria-label="Dashboard navigation"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
