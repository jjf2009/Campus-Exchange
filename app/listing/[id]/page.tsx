import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingActions } from "@/components/ListingActions";
import { Navbar } from "@/components/Navbar";
import { RequestButton } from "@/components/RequestButton";
import { SafeImage } from "@/components/SafeImage";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getListingById } from "@/db/queries/listings";
import { getRequestForListing } from "@/db/queries/requests";
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";
import { formatFullDate, formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  return {
    title: listing?.title ?? "Listing",
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const listing = await getListingById(id);
  const notifications = await getNavbarNotifications(user.id);

  if (!listing || listing.status === "ARCHIVED") {
    notFound();
  }

  const isOwner = listing.sellerId === user.id;
  const existingRequest = isOwner
    ? null
    : await getRequestForListing(listing.id, user.id);

  const isAvailable = listing.status === "AVAILABLE";
  let disabledReason: string | undefined;
  if (listing.status === "SOLD") disabledReason = "This item has been sold.";
  if (listing.status === "PENDING_APPROVAL")
    disabledReason = "Seller is finalizing with another buyer.";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          render={<Link href="/marketplace" />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to marketplace
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {listing.imageUrl ? (
              <SafeImage
                src={listing.imageUrl}
                alt={listing.title}
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                iconClassName="h-20 w-20 opacity-30"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Package className="h-20 w-20 opacity-30" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ListingStatusBadge status={listing.status as ListingStatus} />
                <Badge variant="secondary">{listing.category}</Badge>
                <Badge variant="outline">{listing.condition}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {listing.title}
              </h1>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {listing.description}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 font-semibold">Seller</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{listing.sellerName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Branch</dt>
                  <dd className="font-medium">{listing.sellerBranch ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Year</dt>
                  <dd className="font-medium">{listing.sellerYear ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Posted</dt>
                  <dd className="font-medium">
                    {formatRelativeDate(listing.createdAt)} ·{" "}
                    {formatFullDate(listing.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>

            {isOwner ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This is your listing. Manage it from your dashboard.
                </p>
                <ListingActions
                  listingId={listing.id}
                  status={listing.status as ListingStatus}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <RequestButton
                  listingId={listing.id}
                  alreadyRequested={Boolean(existingRequest)}
                  disabled={!isAvailable && !existingRequest}
                  disabledReason={disabledReason}
                />
                {existingRequest?.status === "PENDING" ? (
                  <p className="text-sm text-muted-foreground">
                    Request sent — waiting for the seller.
                  </p>
                ) : null}
                {existingRequest?.status === "ACCEPTED" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">Request accepted!</p>
                    <p className="mt-1">
                      Check your dashboard requests for the seller&apos;s
                      WhatsApp number.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      render={<Link href="/dashboard/requests" />}
                      nativeButton={false}
                    >
                      View contact
                    </Button>
                  </div>
                ) : null}
                {existingRequest?.status === "REJECTED" ? (
                  <p className="text-sm text-destructive">
                    The seller rejected your request.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
