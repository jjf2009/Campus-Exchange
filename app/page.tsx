import Link from "next/link";
import { PlusCircle, Search, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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
import { getCurrentUser } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";
import { CATEGORIES, getCategoryImage } from "@/lib/constants";
import type { Category, Condition } from "@/types";

const ITEMS_PER_PAGE = 8;

export const metadata = {
  title: "GEC Exchange — Campus Marketplace",
  description: "Browse and trade academic gear, hosteling essentials, and textbooks directly with other GEC students.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const notifications = user ? await getNavbarNotifications(user.id) : null;
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);

  const isFiltered = Boolean(params.q || params.category);

  // Fetch the 4 newest listings for the "Recently Listed" row
  const { items: recentItems } = await getMarketplaceListings({ limit: 4 });

  const sellHref = user ? "/new-listing" : "/login?next=/new-listing";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={user} notifications={notifications} />

      {/* ── Bold, High-Contrast Hero Banner ──────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A1325] py-14 text-white sm:py-20">
        {/* Subtle decorative background glow */}
        <div
          className="absolute -right-36 -top-36 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            {/* Hero Copy */}
            <div className="space-y-6 md:col-span-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Goa College of Engineering P2P Hub
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
                Find it before your <br className="hidden sm:inline" />
                <span className="text-primary">next lecture.</span>
              </h1>
              <p className="max-w-lg text-sm text-slate-300 sm:text-base leading-relaxed">
                Trade boilers, drafters, hosteling essentials, and textbooks directly
                with seniors and peers. Safe, cashless, and 100% on campus.
              </p>

              {/* Quick Hero Search */}
              <div className="max-w-md">
                <Suspense
                  fallback={<div className="h-11 rounded-xl bg-slate-800 animate-pulse" />}
                >
                  <SearchBar placeholder="Search drawing boilers, drafters, calculators..." />
                </Suspense>
              </div>

              {/* Value propositions */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Verified @gecg.ac.in members
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  No commissions or platform fees
                </span>
              </div>
            </div>

            {/* Desktop Hero Illustration / Quick Stats */}
            <div className="hidden md:col-span-5 md:block">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
                <ol className="space-y-4 text-xs text-slate-300">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">1</span>
                    <div>
                      <strong className="text-white block">Browse & Request</strong>
                      Find academic tools or hostel gear and click &ldquo;Request Item&rdquo;.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">2</span>
                    <div>
                      <strong className="text-white block">Seller Acceptance</strong>
                      The seller reviews requests and clicks accept when ready to hand off.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">3</span>
                    <div>
                      <strong className="text-white block">WhatsApp Reveal</strong>
                      WhatsApp contact details unlock only for accepted buyers to complete the deal offline.
                    </div>
                  </li>
                </ol>
                <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ready to declutter?</span>
                  <Button
                    size="sm"
                    render={<Link href={sellHref} />}
                    nativeButton={false}
                    className="gap-1 text-xs"
                  >
                    Sell Gear
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Strip (Shop By Category) ────────────────────────── */}
      <section className="border-b bg-card py-10 shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl mb-6">
            Shop By Category
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted">
            {CATEGORIES.map((cat) => {
              const displayImage = getCategoryImage(cat);
              const isSelected = params.category === cat;

              return (
                <Link
                  key={cat}
                  href={`/?category=${cat}`}
                  className={`group flex min-w-[95px] flex-col items-center gap-2.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 transition-all ${
                    isSelected ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border group-hover:border-primary/40 group-hover:shadow-sm"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImage}
                      alt={cat}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold tracking-wide transition-colors ${
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 space-y-12">
        {/* ── Featured / Recently Listed Panel ───────────────────────── */}
        {!isFiltered && recentItems.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
                  Recently Listed Today
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Fresh academic gear and campus tools listed by fellow students.
                </p>
              </div>
              <Link
                href="/?page=1"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View all items
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentItems.slice(0, 4).map((item) => (
                <div key={item.id} className="relative">
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    category={item.category as Category}
                    condition={item.condition as Condition}
                    imageUrl={item.imageUrl}
                    sellerName={item.sellerName}
                    createdAt={item.createdAt}
                  />
                  {/* Real freshness indicator badge */}
                  <span className="absolute top-2.5 left-2.5 pointer-events-none rounded-md bg-[#0A1325]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
                    Only 1 available
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Main browsable marketplace section ─────────────────────── */}
        <section className="space-y-6 border-t pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
                All Listings
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Filter by category or search keys below.
              </p>
            </div>
            <Button
              render={<Link href={sellHref} />}
              nativeButton={false}
              className="shrink-0 gap-2 font-bold"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Sell an item
            </Button>
          </div>

          {/* Search and Filters row */}
          <div className="space-y-4">
            <Suspense
              fallback={
                <div
                  className="h-11 animate-pulse rounded-xl bg-muted"
                  aria-label="Loading search…"
                />
              }
            >
              <SearchBar placeholder="Search boiler, drafter, mattress..." />
            </Suspense>
            <Suspense
              fallback={
                <div
                  className="h-9 animate-pulse rounded-full bg-muted"
                  aria-label="Loading categories…"
                />
              }
            >
              <CategoryFilter />
            </Suspense>
          </div>

          {/* Active filter badge/labels */}
          {isFiltered && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {params.q ? (
                <>
                  Results for <strong className="text-foreground font-semibold">&ldquo;{params.q}&rdquo;</strong>
                  {params.category ? (
                    <>
                      {" "}
                      in <strong className="text-foreground font-semibold">{params.category}</strong>
                    </>
                  ) : null}
                </>
              ) : params.category ? (
                <>
                  Category: <strong className="text-foreground font-semibold">{params.category}</strong>
                </>
              ) : null}
              <Link href="/" className="ml-2 text-xs text-primary hover:underline font-bold">
                Clear Filters
              </Link>
            </p>
          )}

          {/* Grid listing display */}
          <Suspense fallback={<ListingGridSkeleton />}>
            <MarketplaceGrid
              search={params.q}
              category={params.category}
              page={currentPage}
              sellHref={sellHref}
            />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
}

async function MarketplaceGrid({
  search,
  category,
  page,
  sellHref,
}: {
  search?: string;
  category?: string;
  page: number;
  sellHref: string;
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
        title={search || category ? "No matches found" : "No listings available"}
        description={
          search || category
            ? "Try checking spelling, removing active filters, or typing a new term."
            : "No items listed yet in this section."
        }
        action={
          <Button render={<Link href={sellHref} />} nativeButton={false} className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Be the first to sell
          </Button>
        }
        icon={<Search className="h-7 w-7" />}
      />
    );
  }

  const createPageHref = (nextPage: number) => {
    const p = new URLSearchParams();
    if (search?.trim()) p.set("q", search.trim());
    if (category) p.set("category", category);
    if (nextPage > 1) p.set("page", String(nextPage));
    return `/${p.toString() ? `?${p.toString()}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Results meta */}
      <p className="text-xs sm:text-sm text-muted-foreground">
        Showing {items.length} of {total} {total === 1 ? "listing" : "listings"}
        {totalPages > 1 ? ` (Page ${pageNumber} of ${totalPages})` : null}
      </p>

      {/* Main Grid */}
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
          />
        ))}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Page {pageNumber} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              render={<Link href={createPageHref(pageNumber - 1)} />}
              nativeButton={false}
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
              aria-label="Previous page"
              className="text-xs"
            >
              ← Prev
            </Button>
            <Button
              render={<Link href={createPageHref(pageNumber + 1)} />}
              nativeButton={false}
              size="sm"
              disabled={pageNumber >= totalPages}
              aria-label="Next page"
              className="text-xs font-bold"
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
