"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListing, markListingSold } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import type { ListingStatus } from "@/types";

interface ListingActionsProps {
  listingId: string;
  status: ListingStatus;
}

export function ListingActions({ listingId, status }: ListingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Remove this listing from the marketplace?")) return;
    startTransition(async () => {
      const result = await deleteListing(listingId);
      if (result.success) {
        toast.success("Listing removed");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  function handleSold() {
    if (!confirm("Mark this item as sold? It will leave the marketplace."))
      return;
    startTransition(async () => {
      const result = await markListingSold(listingId);
      if (result.success) {
        toast.success("Marked as sold");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  }

  const canEdit = status === "AVAILABLE" || status === "PENDING_APPROVAL";
  const canSell = status === "AVAILABLE" || status === "PENDING_APPROVAL";

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit ? (
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
      {canSell ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSold}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          )}
          Mark Sold
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
    </div>
  );
}
