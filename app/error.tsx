"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The page hit an unexpected error. Your data is safe — try again, or go
          back to the marketplace.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
