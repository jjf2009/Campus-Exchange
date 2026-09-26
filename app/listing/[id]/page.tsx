import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingActions } from "@/components/ListingActions";
import { Navbar } from "@/components/Navbar";
import {
  ContactSellerButton,
  type ContactState,
} from "@/components/ContactSellerButton";
import { SafeImage } from "@/components/SafeImage";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Sticker } from "@/components/brand";
import { getListingById } from "@/db/queries/listings";
import { getListingContactBuyers } from "@/db/queries/contacts";
import { requireCompleteProfile } from "@/lib/auth";
import {
  CATEGORY_EMOJI,
  HOLD_EXPIRES_AFTER_DAYS,
  getCategoryImage,
} from "@/lib/constants";
import { formatFullDate, formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { Category, ListingStatus } from "@/types";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const { error } = await searchParams;
  const listing = await getListingById(id);

  if (!listing || listing.status === "ARCHIVED") {
    notFound();
  }

  const isOwner = listing.sellerId === user.id;
  const buyers = isOwner ? await getListingContactBuyers(listing.id) : [];
  const holderName =
    isOwner && listing.heldByUserId
      ? buyers.find((b) => b.id === listing.heldByUserId)?.name
      : undefined;

  const canContact = listing.status === "AVAILABLE";
  const contactState: ContactState =
    listing.status === "AVAILABLE"
      ? "available"
      : listing.status === "RESERVED"
        ? listing.heldByUserId === user.id
          ? "held-by-you"
          : "held"
        : listing.status === "SOLD"
          ? "sold"
          : "hidden";

  const displayImage =
    listing.imageUrl && listing.imageUrl.startsWith("/")
      ? listing.imageUrl
      : getCategoryImage(listing.category);

  const actions = isOwner ? (
    <div className="space-y-3">
      <p className="font-medium">
        {listing.status === "RESERVED"
          ? `📌 On hold for ${holderName ?? "a buyer"}. Mark it sold if it sells, or it comes back on the marketplace ${HOLD_EXPIRES_AFTER_DAYS} days after the hold started.`
          : listing.status === "EXPIRED"
            ? "Hidden after 30 days without changes. Relist it if it's still for sale."
            : "Your listing. Buyers will message you on WhatsApp."}
      </p>
      <ListingActions
        listingId={listing.id}
        status={listing.status as ListingStatus}
        buyers={buyers}
        heldByUserId={listing.heldByUserId}
      />
    </div>
  ) : (
    <ContactSellerButton listingId={listing.id} state={contactState} error={error} />
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Link
          href="/marketplace"
          className="mb-6 inline-flex items-center gap-1.5 font-display font-bold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-ink bg-muted shadow-brutal-lg">
              <SafeImage
                src={displayImage}
                alt={listing.title}
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                iconClassName="h-20 w-20 opacity-30"
              />
            </div>
            <Sticker
              color="lime"
              tilt={-6}
              className="absolute -bottom-5 -left-2 px-4 py-2 text-3xl sm:text-4xl"
            >
              {formatPrice(listing.price)}
            </Sticker>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ListingStatusBadge status={listing.status as ListingStatus} />
                <Badge variant="outline">
                  {CATEGORY_EMOJI[listing.category as Category] ?? "📦"}{" "}
                  {listing.category}
                </Badge>
                <Badge variant="outline">{listing.condition}</Badge>
              </div>
              <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
                {listing.title}
              </h1>
              {canContact ? (
                <p className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-lime px-2 py-0.5 text-sm font-bold">
                  ✓ Available · updated{" "}
                  {formatRelativeDate(listing.lastConfirmedAt)}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-5 shadow-brutal">
              {actions}
            </div>

            <div>
              <h2 className="mb-2 font-display text-xl font-extrabold">
                The details
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Student-ID style seller card */}
            <div className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-brutal">
              <div className="flex items-center justify-between border-b-2 border-ink bg-primary px-4 py-2 text-primary-foreground">
                <span className="font-display text-sm font-extrabold tracking-widest uppercase">
                  Seller ID
                </span>
                <span className="text-xs font-bold">GEC student</span>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="flex size-16 shrink-0 -rotate-3 items-center justify-center rounded-lg border-2 border-ink bg-sun font-display text-2xl font-extrabold">
                  {listing.sellerName.slice(0, 1).toUpperCase()}
                </div>
                <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="col-span-2">
                    <dt className="text-xs font-bold uppercase text-muted-foreground">
                      Name
                    </dt>
                    <dd className="font-display text-lg font-bold">
                      {listing.sellerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted-foreground">
                      Branch
                    </dt>
                    <dd className="font-semibold">
                      {listing.sellerBranch ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted-foreground">
                      Year
                    </dt>
                    <dd className="font-semibold">
                      {listing.sellerYear ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="border-t-2 border-dashed border-ink px-4 py-2 text-xs font-medium text-muted-foreground">
                Posted {formatRelativeDate(listing.createdAt)} ·{" "}
                {formatFullDate(listing.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
