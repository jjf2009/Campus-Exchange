"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  function select(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    // Reset to page 1 when changing filter
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const options = ["all", ...CATEGORIES];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      {options.map((category) => {
        const isActive = active === category;
        const label = category === "all" ? "All" : category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => select(category)}
            aria-pressed={isActive}
            className={cn(
              "shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
