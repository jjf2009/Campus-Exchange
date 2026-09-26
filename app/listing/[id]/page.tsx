import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingActions } from "@/components/ListingActions";
import { Navbar } from "@/components/Navbar";
import { ContactSellerButton } from "@/components/ContactSellerButton";
import { SafeImage } from "@/components/SafeImage";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getListingById } from "@/db/queries/listings";
import { getContact, getListingContactBuyers } from "@/db/queries/contacts";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
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
  const [contact, buyers] = await Promise.all([
    isOwner ? null : getContact(listing.id, user.id),
    isOwner ? getListingContactBuyers(listing.id) : [],
  ]);

  const canContact =
    listing.status === "AVAILABLE" || listing.status === "RESERVED";
  let unavailableReason: string | undefined;
  if (listing.status === "SOLD") unavailableReason = "This item has been sold.";
  if (listing.status === "EXPIRED")
    unavailableReason = "The seller hasn't confirmed this is still available.";

  const displayImage =
    listing.imageUrl && listing.imageUrl.startsWith("/")
      ? listing.imageUrl
      : getCategoryImage(listing.category);

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
            <SafeImage
              src={displayImage}
              alt={listing.title}
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              iconClassName="h-20 w-20 opacity-30"
            />
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
              {canContact ? (
                <p className="text-sm text-muted-foreground">
                  Confirmed available{" "}
                  {formatRelativeDate(listing.lastConfirmedAt)}
                  {listing.contactCount > 0
                    ? ` · ${listing.contactCount} ${listing.contactCount === 1 ? "student" : "students"} interested`
                    : ""}
                </p>
              ) : null}
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
                  {buyers.length > 0
                    ? `${buyers.length} ${buyers.length === 1 ? "student has" : "students have"} contacted you about this on WhatsApp.`
                    : "This is your listing. Buyers will message you on WhatsApp."}
                </p>
                <ListingActions
                  listingId={listing.id}
                  status={listing.status as ListingStatus}
                  buyers={buyers}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {listing.status === "RESERVED" ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Reserved for another buyer. You can still message the
                    seller in case the deal falls through.
                  </p>
                ) : null}
                <ContactSellerButton
                  listingId={listing.id}
                  available={canContact}
                  unavailableReason={unavailableReason}
                  contacted={Boolean(contact)}
                  reported={Boolean(contact?.reportedUnavailableAt)}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
