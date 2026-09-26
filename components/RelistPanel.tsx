"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { markListingSold, relistListing } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types";

/** The two choices a seller has when a hold ends. */
export function RelistPanel({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, message: string) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(message);
        router.push(`/listing/${listingId}`);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="grid gap-3">
      <Button
        size="xl"
        variant="lime"
        className="h-auto min-h-14 py-3 text-base whitespace-normal"
        disabled={isPending}
        onClick={() =>
          run(() => relistListing(listingId), "Back on the marketplace")
        }
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <RefreshCw className="size-5" />
        )}
        Put it back on the marketplace
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-auto min-h-11 py-2.5 whitespace-normal"
        disabled={isPending}
        onClick={() => run(() => markListingSold(listingId), "Marked as sold")}
      >
        <CheckCircle2 className="size-5" />
        It sold: mark as sold
      </Button>
    </div>
  );
}
