import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, GraduationCap, User } from "lucide-react";
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
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
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
    title: listing?.title
      ? `${listing.title} — GEC Exchange`
      : "Listing — GEC Exchange",
    description: listing?.description?.slice(0, 150),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const listing = await getListingById(id);
  const notifications = user ? await getNavbarNotifications(user.id) : null;
  const isComplete = user ? isProfileComplete(user) : false;

  if (!listing || listing.status === "ARCHIVED") {
    notFound();
  }

  const isOwner = user ? listing.sellerId === user.id : false;
  const existingRequest = user && !isOwner
    ? await getRequestForListing(listing.id, user.id)
    : null;

  const isAvailable = listing.status === "AVAILABLE";
  let disabledReason: string | undefined;
  if (listing.status === "SOLD")
    disabledReason = "This item has already been sold.";
  if (listing.status === "PENDING_APPROVAL")
    disabledReason = "Seller is finalising with another buyer.";

  const displayImage =
    listing.imageUrl && listing.imageUrl.startsWith("/")
      ? listing.imageUrl
      : getCategoryImage(listing.category);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground"
          render={<Link href="/" />}
          nativeButton={false}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to marketplace
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* ── Image ──────────────────────────────────────────────── */}
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm">
            <SafeImage
              src={displayImage}
              alt={listing.title}
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              iconClassName="h-20 w-20 opacity-25"
            />
            {/* Status badge overlay */}
            <div className="absolute left-3 top-3">
              <ListingStatusBadge status={listing.status as ListingStatus} />
            </div>
          </div>

          {/* ── Info panel ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Title + badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {listing.category}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {listing.condition}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {listing.title}
              </h1>

              {/* Price — unmissable */}
              <p
                className="text-4xl font-bold text-primary"
                aria-label={`Price: ${formatPrice(listing.price)}`}
              >
                {formatPrice(listing.price)}
              </p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {listing.description}
              </p>
            </div>

            {/* Seller card */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Seller
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <SellerField
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Name"
                  value={listing.sellerName}
                />
                <SellerField
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  label="Branch"
                  value={listing.sellerBranch ?? "—"}
                />
                <SellerField
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  label="Year"
                  value={listing.sellerYear ?? "—"}
                />
                <SellerField
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Listed"
                  value={`${formatRelativeDate(listing.createdAt)} · ${formatFullDate(listing.createdAt)}`}
                />
              </div>
            </div>

            {/* CTA zone */}
            {isOwner ? (
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  This is your listing — manage it below.
                </p>
                <ListingActions
                  listingId={listing.id}
                  status={listing.status as ListingStatus}
                />
              </div>
            ) : (
              <RequestZone
                listingId={listing.id}
                isAvailable={isAvailable}
                existingRequest={existingRequest}
                disabledReason={disabledReason}
                isAuthenticated={!!user}
                isProfileComplete={isComplete}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SellerField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function RequestZone({
  listingId,
  isAvailable,
  existingRequest,
  disabledReason,
  isAuthenticated,
  isProfileComplete,
}: {
  listingId: string;
  isAvailable: boolean;
  existingRequest: { status: string } | null;
  disabledReason?: string;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
}) {
  // Accepted — WhatsApp unlock moment
  if (existingRequest?.status === "ACCEPTED") {
    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            {/* WhatsApp mark via Lucide MessageCircle in green */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-[#25D366]"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.85L0 24l6.336-1.51A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.364l-.358-.213-3.765.898.928-3.657-.234-.376A9.818 9.818 0 1 1 12 21.818z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Request accepted!</p>
            <p className="mt-1 text-sm text-emerald-800">
              The seller&apos;s WhatsApp number is now available. Head to your
              requests to see it and close the deal on campus.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          render={<Link href="/dashboard/requests" />}
          nativeButton={false}
        >
          View WhatsApp number →
        </Button>
      </div>
    );
  }

  // Pending
  if (existingRequest?.status === "PENDING") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Request sent ✓</p>
          <p className="mt-1 text-amber-800">
            Waiting for the seller to accept. You&apos;ll get a notification.
          </p>
        </div>
        <Button disabled className="w-full" size="lg">
          Request pending…
        </Button>
      </div>
    );
  }

  // Rejected
  if (existingRequest?.status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold">Request not accepted</p>
        <p className="mt-1">The seller chose another buyer for this item.</p>
      </div>
    );
  }

  // Default — request CTA
  return (
    <div className="space-y-3">
      {disabledReason && (
        <p className="text-sm text-muted-foreground">{disabledReason}</p>
      )}
      <RequestButton
        listingId={listingId}
        alreadyRequested={Boolean(existingRequest)}
        disabled={!isAvailable && !existingRequest}
        disabledReason={disabledReason}
        isAuthenticated={isAuthenticated}
        isProfileComplete={isProfileComplete}
      />
      <p className="text-xs text-muted-foreground text-center">
        Requesting doesn&apos;t commit you to buy — the seller picks one person, then
        contacts you via WhatsApp.
      </p>
    </div>
  );
}
