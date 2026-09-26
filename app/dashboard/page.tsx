import Link from "next/link";
import { BellRing, Bookmark, Package, ShoppingBag, Users } from "lucide-react";
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
  getListingsNeedingAttention,
  getSellerStats,
} from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
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
    getListingsNeedingAttention(user.id),
    getContactsForSeller(user.id),
  ]);

  const liveContacts = contacts.filter(
    (c) => c.listingStatus === "AVAILABLE" || c.listingStatus === "RESERVED"
  );
  const buyersByListing = new Map<string, { id: string; name: string }[]>();
  for (const c of contacts) {
    const list = buyersByListing.get(c.listingId) ?? [];
    list.push({ id: c.buyerId, name: c.buyerName });
    buyersByListing.set(c.listingId, list);
  }

  return (
    <div className="space-y-6">
      {attention.length > 0 ? (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              Are these still available?
            </CardTitle>
            <CardDescription>
              One tap keeps the marketplace accurate for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attention.map((listing) => (
              <div
                key={listing.id}
                className="space-y-2 rounded-lg border bg-background p-3"
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
                <p className="text-xs text-muted-foreground">
                  {formatPrice(listing.price)} · last confirmed{" "}
                  {formatRelativeDate(listing.lastConfirmedAt)}
                  {listing.contactCount > 0
                    ? ` · ${listing.contactCount} interested`
                    : ""}
                </p>
                <ListingActions
                  listingId={listing.id}
                  status={listing.status as ListingStatus}
                  buyers={buyersByListing.get(listing.id) ?? []}
                  askToConfirm
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
        />
        <StatCard
          title="Reserved"
          value={stats.reserved}
          icon={<Bookmark className="h-4 w-4" />}
        />
        <StatCard
          title="Sold"
          value={stats.sold}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Interested buyers"
          value={liveContacts.length}
          icon={<Users className="h-4 w-4" />}
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
          <Button render={<Link href="/new-listing" />} nativeButton={false}>
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
            Interested buyers
            {liveContacts.length > 0 ? ` (${liveContacts.length})` : ""}
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
