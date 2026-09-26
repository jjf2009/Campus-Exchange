"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/requests", label: "Interested", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] sm:mx-0 sm:flex-col sm:overflow-visible sm:px-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all",
              active
                ? "border-ink bg-lime text-ink shadow-brutal-sm"
                : "border-transparent text-ink hover:border-ink hover:bg-card"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
