import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ListingActions } from "@/components/ListingActions";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getListingsBySeller } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

export const metadata = {
  title: "My Listings",
};

export default async function MyListingsPage() {
  const user = await requireCompleteProfile();
  const items = await getListingsBySeller(user.id);

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
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-24">
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
              </div>
              <ListingActions
                listingId={item.id}
                status={item.status as ListingStatus}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
