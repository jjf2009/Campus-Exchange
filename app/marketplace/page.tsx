import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { ListingGridSkeleton } from "@/components/ListingCardSkeleton";
import { Navbar } from "@/components/Navbar";
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="mt-1 text-muted-foreground">
              Find used academic gear from fellow GEC students.
            </p>
          </div>
          <Button render={<Link href="/new-listing" />} nativeButton={false}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Sell an item
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <Suspense
            fallback={
              <div className="h-11 animate-pulse rounded-md bg-muted" />
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
          <p className="text-sm text-muted-foreground">
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
