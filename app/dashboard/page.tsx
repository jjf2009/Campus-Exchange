import Link from "next/link";
import { ArrowRight, Inbox, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth";
import { getSellerStats } from "@/db/queries/listings";
import { countPendingRequestsForSeller } from "@/db/queries/requests";

export const metadata = {
  title: "Dashboard — GEC Exchange",
};

export default async function DashboardPage() {
  const user = await requireCompleteProfile();
  const [stats, pendingRequests] = await Promise.all([
    getSellerStats(user.id),
    countPendingRequestsForSeller(user.id),
  ]);

  return (
    <div className="space-y-8">
      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active listings"
          value={stats.available}
          icon={<Package className="h-4 w-4" />}
          href="/dashboard/listings"
          accent={false}
        />
        <StatCard
          title="Pending deals"
          value={stats.pending}
          icon={<ShoppingBag className="h-4 w-4" />}
          href="/dashboard/listings"
          accent={false}
        />
        <StatCard
          title="Items sold"
          value={stats.sold}
          icon={<TrendingUp className="h-4 w-4" />}
          href="/dashboard/listings"
          accent={false}
        />
        <StatCard
          title="Incoming requests"
          value={pendingRequests}
          icon={<Inbox className="h-4 w-4" />}
          href="/dashboard/requests"
          accent={pendingRequests > 0}
          accentLabel={pendingRequests > 0 ? "Action needed" : undefined}
        />
      </div>

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Quick actions</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          The most common things you&apos;ll do here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            render={<Link href="/new-listing" />}
            nativeButton={false}
            className="gap-2"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            List new item
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
            className={pendingRequests > 0 ? "border-primary text-primary" : ""}
          >
            Review requests
            {pendingRequests > 0 ? (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {pendingRequests}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* ── Tips (only if no listings yet) ──────────────────────── */}
      {stats.available === 0 && stats.sold === 0 && (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-6">
          <h2 className="mb-1 text-base font-semibold">
            New here? Here&apos;s how it works
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>List a boiler, drafter, calculator, mattress — anything you don&apos;t need.</li>
            <li>Buyers send requests. You pick one person.</li>
            <li>They get your WhatsApp number. You meet on campus and exchange.</li>
          </ol>
          <Button
            className="mt-5 gap-2"
            render={<Link href="/new-listing" />}
            nativeButton={false}
          >
            Create your first listing
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── StatCard ────────────────────────────────────────────────────────── */
function StatCard({
  title,
  value,
  icon,
  href,
  accent,
  accentLabel,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  accent: boolean;
  accentLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${
        accent ? "border-primary/30 bg-primary/4" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className={`text-3xl font-bold ${
            accent ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {accentLabel && (
          <span className="mb-0.5 text-xs font-medium text-primary">
            {accentLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
