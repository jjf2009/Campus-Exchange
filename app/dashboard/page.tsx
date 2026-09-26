import Link from "next/link";
import { Pin, Bookmark, Package, ShoppingBag, Users } from "lucide-react";
import { ListingActions } from "@/components/ListingActions";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactsForSeller } from "@/db/queries/contacts";
import {
  getHeldListings,
  getSellerStats,
} from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { EXPIRE_AFTER_DAYS, HOLD_EXPIRES_AFTER_DAYS } from "@/lib/constants";
import { formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireCompleteProfile();
  const [stats, attention, contacts] = await Promise.all([
    getSellerStats(user.id),
    getHeldListings(user.id),
    getContactsForSeller(user.id),
  ]);

  const buyersByListing = new Map<string, { id: string; name: string }[]>();
  for (const c of contacts) {
    const list = buyersByListing.get(c.listingId) ?? [];
    list.push({ id: c.buyerId, name: c.buyerName });
    buyersByListing.set(c.listingId, list);
  }

  return (
    <div className="space-y-6">
      {attention.length > 0 ? (
        <Card className="bg-sun">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Pin className="size-5" />
              Hidden right now
            </CardTitle>
            <CardDescription className="font-medium text-ink/80">
              Sold? Mark it sold, or it comes back after{" "}
              {HOLD_EXPIRES_AFTER_DAYS} days. Deal off? Relist it now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attention.map((listing) => (
              <div
                key={listing.id}
                className="space-y-3 rounded-lg border-2 border-ink bg-card p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {listing.title}
                  </Link>
                  <ListingStatusBadge status={listing.status as ListingStatus} />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatPrice(listing.price)} ·{" "}
                  {listing.status === "RESERVED" && listing.heldAt
                    ? `on hold for ${listing.holderName ?? "a buyer"} since ${formatRelativeDate(listing.heldAt)}`
                    : `hidden after ${EXPIRE_AFTER_DAYS} days without changes`}
                </p>
                <ListingActions
                  listingId={listing.id}
                  status={listing.status as ListingStatus}
                  buyers={buyersByListing.get(listing.id) ?? []}
                  heldByUserId={listing.heldByUserId}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active listings"
          value={stats.available}
          icon={<Package className="h-4 w-4" />}
          className="bg-lime"
        />
        <StatCard
          title="On hold"
          value={stats.reserved}
          icon={<Bookmark className="h-4 w-4" />}
          className="bg-sun"
        />
        <StatCard
          title="Sold"
          value={stats.sold}
          icon={<ShoppingBag className="h-4 w-4" />}
          className="bg-card"
        />
        <StatCard
          title="Buyers so far"
          value={contacts.length}
          icon={<Users className="h-4 w-4" />}
          className="bg-pink"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>
            Jump into the most common seller tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="lime"
            render={<Link href="/new-listing" />}
            nativeButton={false}
          >
            Create listing
          </Button>
          <Button
            variant="outline"
            render={<Link href="/dashboard/listings" />}
            nativeButton={false}
          >
            My listings
          </Button>
          <Button
            variant="outline"
            render={<Link href="/dashboard/requests" />}
            nativeButton={false}
          >
            Buyers who messaged you
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-bold text-ink">{title}</CardTitle>
        <div className="text-ink">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-5xl font-extrabold">{value}</div>
      </CardContent>
    </Card>
  );
}
