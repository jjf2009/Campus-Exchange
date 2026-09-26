import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ListingActions } from "@/components/ListingActions";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContactsForSeller } from "@/db/queries/contacts";
import { getListingsBySeller } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

export const metadata = {
  title: "My Listings",
};

export default async function MyListingsPage() {
  const user = await requireCompleteProfile();
  const [items, contacts] = await Promise.all([
    getListingsBySeller(user.id),
    getContactsForSeller(user.id),
  ]);
  const buyersByListing = new Map<string, { id: string; name: string }[]>();
  for (const c of contacts) {
    const list = buyersByListing.get(c.listingId) ?? [];
    list.push({ id: c.buyerId, name: c.buyerName });
    buyersByListing.set(c.listingId, list);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="You haven't listed anything yet"
        description="List boilers, drafters, books, or hostel gear for juniors on campus."
        action={
          <Button render={<Link href="/new-listing" />} nativeButton={false}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create listing
            </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My listings</h2>
        <Button size="sm" render={<Link href="/new-listing" />} nativeButton={false}>
              <PlusCircle className="mr-1.5 h-4 w-4" />
            New
            </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-muted sm:w-24">
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
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listing/${item.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <ListingStatusBadge status={item.status as ListingStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.price)} · {item.category} · {item.condition}
                </p>
                {item.status === "RESERVED" && item.heldAt ? (
                  <p className="text-xs font-semibold">
                    📌 On hold for {item.holderName ?? "a buyer"} since{" "}
                    {formatRelativeDate(item.heldAt)}
                  </p>
                ) : item.status === "AVAILABLE" ? (
                  <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeDate(item.lastConfirmedAt)}
                  </p>
                ) : null}
              </div>
              <ListingActions
                listingId={item.id}
                status={item.status as ListingStatus}
                buyers={buyersByListing.get(item.id) ?? []}
                heldByUserId={item.heldByUserId}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
