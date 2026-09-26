"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  BookmarkX,
  CheckCircle2,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  confirmAvailable,
  deleteListing,
  markListingSold,
  setListingReserved,
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
  /** Show a "Still available" button (seller was asked to confirm). */
  askToConfirm?: boolean;
}

export function ListingActions({
  listingId,
  status,
  buyers = [],
  askToConfirm = false,
}: ListingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [soldOpen, setSoldOpen] = useState(false);
  const [soldTo, setSoldTo] = useState("");

  function run(
    action: () => Promise<ActionResult>,
    successMessage: string,
    onDone?: () => void
  ) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          toast.success(successMessage);
          onDone?.();
          router.refresh();
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

  const isLive = status === "AVAILABLE" || status === "RESERVED";
  const isOpen = isLive || status === "EXPIRED";

  return (
    <div className="flex flex-wrap gap-2">
      {status === "EXPIRED" ? (
        <Button
          size="sm"
          onClick={() =>
            run(() => confirmAvailable(listingId), "Listing is live again")
          }
          disabled={isPending}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Renew
        </Button>
      ) : null}
      {askToConfirm && isLive ? (
        <Button
          size="sm"
          onClick={() =>
            run(() => confirmAvailable(listingId), "Thanks for confirming!")
          }
          disabled={isPending}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Still available
        </Button>
      ) : null}
      {status === "AVAILABLE" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            run(() => setListingReserved(listingId, true), "Marked as reserved")
          }
          disabled={isPending}
        >
          <Bookmark className="mr-1.5 h-3.5 w-3.5" />
          Reserve
        </Button>
      ) : null}
      {status === "RESERVED" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            run(
              () => setListingReserved(listingId, false),
              "Available again"
            )
          }
          disabled={isPending}
        >
          <BookmarkX className="mr-1.5 h-3.5 w-3.5" />
          Unreserve
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
              It will leave the marketplace, and everyone who asked about it
              will be told it&apos;s gone.
            </DialogDescription>
          </DialogHeader>
          {buyers.length > 0 ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Who bought it? (optional)</span>
              <select
                value={soldTo}
                onChange={(e) => setSoldTo(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-2.5"
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
