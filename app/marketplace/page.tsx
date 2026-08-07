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

export const metadata = {
  title: "Marketplace",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const user = await requireCompleteProfile();
  const params = await searchParams;
  const notifications = await getNavbarNotifications(user.id);

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
          <MarketplaceGrid search={params.q} category={params.category} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function MarketplaceGrid({
  search,
  category,
}: {
  search?: string;
  category?: string;
}) {
  const items = await getMarketplaceListings({ search, category });

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

  return (
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
  );
}
