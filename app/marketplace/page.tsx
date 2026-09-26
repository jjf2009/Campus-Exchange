import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { ListingGridSkeleton } from "@/components/ListingCardSkeleton";
import { Navbar } from "@/components/Navbar";
import { Sticker } from "@/components/brand";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { getMarketplaceListings } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";
import type { Category, Condition } from "@/types";

const ITEMS_PER_PAGE = 8;

export const metadata = {
  title: "Marketplace",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const user = await requireCompleteProfile();
  const params = await searchParams;
  const notifications = await getNavbarNotifications(user.id);
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <section className="border-b-2 border-ink bg-grid">
        <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Sticker color="pink" tilt={-3} className="mb-3 text-xs">
                Marketplace
              </Sticker>
              <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight sm:text-6xl">
                What are you <span className="marker">hunting</span> for?
              </h1>
            </div>
            <Button
              variant="lime"
              size="lg"
              render={<Link href="/new-listing" />}
              nativeButton={false}
            >
              <PlusCircle className="size-5" />
              Sell an item
            </Button>
          </div>

          <div className="space-y-4">
          <Suspense
            fallback={
              <div className="h-14 animate-pulse rounded-xl border-2 border-ink bg-card" />
            }
          >
            <SearchBar placeholder="Search boiler, drafter, calculator…" />
          </Suspense>
          <Suspense
            fallback={<div className="h-9 animate-pulse rounded-md bg-muted" />}
          >
            <CategoryFilter />
          </Suspense>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<ListingGridSkeleton />}>
          <MarketplaceGrid
            search={params.q}
            category={params.category}
            page={currentPage}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function MarketplaceGrid({
  search,
  category,
  page,
}: {
  search?: string;
  category?: string;
  page: number;
}) {
  const { total } = await getMarketplaceListings({ search, category });
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const pageNumber = Math.min(page, totalPages);
  const { items } = await getMarketplaceListings({
    search,
    category,
    limit: ITEMS_PER_PAGE,
    offset: (pageNumber - 1) * ITEMS_PER_PAGE,
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description={
          search || category
            ? "Try a different search or category."
            : "Be the first to list something for campus."
        }
        action={
          <Button render={<Link href="/new-listing" />} nativeButton={false}>
            Create listing
          </Button>
        }
      />
    );
  }

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.set("q", search.trim());
    if (category) params.set("category", category);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/marketplace${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <p className="font-display text-lg font-bold">
        {total} {total === 1 ? "item" : "items"}
        {search?.trim() ? ` for “${search.trim()}”` : ""} on the shelf
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ListingCard
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            category={item.category as Category}
            condition={item.condition as Condition}
            imageUrl={item.imageUrl}
            sellerName={item.sellerName}
            createdAt={item.createdAt}
            reserved={item.status === "RESERVED"}
            lastConfirmedAt={item.lastConfirmedAt}
            contactCount={item.contactCount}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-4 py-3 shadow-brutal-sm">
          <p className="text-sm font-bold">
            Page {pageNumber} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              render={<Link href={createPageHref(pageNumber - 1)} />}
              nativeButton={false}
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <Button
              render={<Link href={createPageHref(pageNumber + 1)} />}
              nativeButton={false}
              size="sm"
              disabled={pageNumber >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
