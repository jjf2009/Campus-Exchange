import Link from "next/link";
import { Inbox, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSellerStats } from "@/db/queries/listings";
import { countPendingRequestsForSeller } from "@/db/queries/requests";
import { requireCompleteProfile } from "@/lib/auth";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireCompleteProfile();
  const [stats, pendingRequests] = await Promise.all([
    getSellerStats(user.id),
    countPendingRequestsForSeller(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active listings"
          value={stats.available}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Pending deals"
          value={stats.pending}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Sold"
          value={stats.sold}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Incoming requests"
          value={pendingRequests}
          icon={<Inbox className="h-4 w-4" />}
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
          <Button variant="outline" render={<Link href="/dashboard/listings" />} nativeButton={false}>
              My listings
            </Button>
          <Button variant="outline" render={<Link href="/dashboard/requests" />} nativeButton={false}>
              Review requests
              {pendingRequests > 0 ? ` (${pendingRequests})` : ""}
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
