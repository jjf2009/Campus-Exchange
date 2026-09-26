"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteListing,
  markListingSold,
  relistListing,
} from "@/actions/listings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult, ListingStatus } from "@/types";

interface ListingActionsProps {
  listingId: string;
  status: ListingStatus;
  /** Buyers who contacted this listing, for the "who bought it?" picker. */
  buyers?: { id: string; name: string }[];
  /** Buyer the item is on hold for; preselected as the buyer. */
  heldByUserId?: string | null;
  /** Called after a successful action instead of refreshing (e.g. redirect). */
  onDone?: () => void;
}

export function ListingActions({
  listingId,
  status,
  buyers = [],
  heldByUserId,
  onDone,
}: ListingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [soldOpen, setSoldOpen] = useState(false);
  const [soldTo, setSoldTo] = useState(heldByUserId ?? "");

  function run(
    action: () => Promise<ActionResult>,
    successMessage: string,
    after?: () => void
  ) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          toast.success(successMessage);
          after?.();
          if (onDone) onDone();
          else router.refresh();
        } else {
          toast.error(result.error ?? "Failed to update");
        }
      } catch (error) {
        console.error("ListingActions error:", error);
        toast.error("Failed to update. Please try again.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Remove this listing from the marketplace?")) return;
    run(() => deleteListing(listingId), "Listing removed");
  }

  const isOpen =
    status === "AVAILABLE" || status === "RESERVED" || status === "EXPIRED";
  const canRelist = status === "RESERVED" || status === "EXPIRED";

  return (
    <div className="flex flex-wrap gap-2">
      {canRelist ? (
        <Button
          size="sm"
          variant="lime"
          onClick={() =>
            run(() => relistListing(listingId), "Back on the marketplace")
          }
          disabled={isPending}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Relist
        </Button>
      ) : null}
      {isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoldOpen(true)}
          disabled={isPending}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Mark Sold
        </Button>
      ) : null}
      {isOpen ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/edit-listing/${listingId}`} />}
          nativeButton={false}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete
        </Button>
      ) : null}

      <Dialog open={soldOpen} onOpenChange={setSoldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as sold?</DialogTitle>
            <DialogDescription>
              It will stay off the marketplace for good.
            </DialogDescription>
          </DialogHeader>
          {buyers.length > 0 ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Who bought it? (optional)</span>
              <select
                value={soldTo}
                onChange={(e) => setSoldTo(e.target.value)}
                className="h-9 w-full rounded-lg border-2 border-ink bg-background px-2.5"
              >
                <option value="">Someone else / not sure</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={<Button variant="outline" disabled={isPending} />}
            >
              Cancel
            </DialogClose>
            <Button
              onClick={() =>
                run(
                  () => markListingSold(listingId, soldTo || null),
                  "Marked as sold",
                  () => setSoldOpen(false)
                )
              }
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Mark sold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
