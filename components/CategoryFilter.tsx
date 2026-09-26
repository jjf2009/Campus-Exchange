"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
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
    router.push(`${pathname}?${params.toString()}`);
  }

  const options = ["all", ...CATEGORIES];

return (
  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
    {options.map((category) => {
      const isActive = active === category;

      return (
        <button
          key={category}
          type="button"
          onClick={() => select(category)}
          className={cn(
            "shrink-0 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold transition-all",
            isActive
              ? "bg-ink text-lime shadow-brutal-sm"
              : "bg-card text-ink hover:-translate-y-0.5 hover:bg-lime hover:shadow-brutal-sm"
          )}
        >
          {category === "all"
            ? "✺ All"
            : `${CATEGORY_EMOJI[category as keyof typeof CATEGORY_EMOJI]} ${category}`}
        </button>
      );
    })}
  </div>
);
}
