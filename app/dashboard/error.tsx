"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary:", error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Dashboard error</h2>
      <p className="text-sm text-muted-foreground">
        Something failed while loading this section. Try again or return to the
        marketplace.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/marketplace" />}
          nativeButton={false}
        >
          Marketplace
        </Button>
      </div>
    </div>
  );
}
