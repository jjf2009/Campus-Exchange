import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ListingActions } from "@/components/ListingActions";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getListingsBySeller } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

export const metadata = {
  title: "My Listings — GEC Exchange",
};

export default async function MyListingsPage() {
  const user = await requireCompleteProfile();
  const items = await getListingsBySeller(user.id);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No items listed yet"
        description="List your old drafters, boilers, textbooks, or hostel gear to clear clutter."
        action={
          <Button render={<Link href="/new-listing" />} nativeButton={false}>
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Create your first listing
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">My listings</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            You have {items.length} {items.length === 1 ? "item" : "items"} listed on the campus.
          </p>
        </div>
        <Button
          size="sm"
          render={<Link href="/new-listing" />}
          nativeButton={false}
          className="shrink-0 gap-1.5"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Sell item
        </Button>
      </div>

      {/* Grid of items */}
      <div className="space-y-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
          >
            {/* Image thumbnail */}
            <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-24">
              <Image
                src={
                  item.imageUrl?.startsWith("/")
                    ? item.imageUrl
                    : getCategoryImage(item.category)
                }
                alt={item.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Title / meta */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/listing/${item.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>
                <ListingStatusBadge status={item.status as ListingStatus} />
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                <strong className="font-semibold text-foreground">
                  {formatPrice(item.price)}
                </strong>{" "}
                · {item.category} · {item.condition}
              </p>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 border-t pt-3 sm:border-t-0 sm:pt-0">
              <ListingActions
                listingId={item.id}
                status={item.status as ListingStatus}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
