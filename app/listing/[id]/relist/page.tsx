import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand";
import { RelistPanel } from "@/components/RelistPanel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getListingById } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { formatRelativeDate } from "@/utils/formatDate";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Relist item",
};

/**
 * Landing page for the link inside the buyer's WhatsApp message. The seller
 * signs in (middleware sends them to /login and back) and picks relist/sold.
 */
export default async function RelistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing || listing.status === "ARCHIVED") notFound();

  const isSeller = listing.sellerId === user.id;
  const [holder] =
    isSeller && listing.heldByUserId
      ? await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, listing.heldByUserId))
          .limit(1)
      : [];

  let title: string;
  let description: string;
  let body: React.ReactNode = (
    <Button
      variant="outline"
      render={<Link href={`/listing/${listing.id}`} />}
      nativeButton={false}
    >
      View listing
    </Button>
  );

  if (!isSeller) {
    title = "Only the seller can do this";
    description = `This link is for the seller of ${listing.title}. Sign in with their account to relist it.`;
  } else if (listing.status === "RESERVED" || listing.status === "EXPIRED") {
    title = `${listing.title} is hidden`;
    description =
      listing.status === "RESERVED"
        ? `On hold for ${holder?.name ?? "a buyer"}${listing.heldAt ? ` since ${formatRelativeDate(listing.heldAt)}` : ""}. Did the deal fall through?`
        : "It was hidden after a long time without changes. Still selling it?";
    body = <RelistPanel listingId={listing.id} />;
  } else if (listing.status === "AVAILABLE") {
    title = "Already on the marketplace";
    description = `${listing.title} is live. Buyers can see it right now.`;
  } else {
    title = "Marked as sold";
    description = `${listing.title} is sold and stays hidden.`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4 py-10">
      <Card className="w-full max-w-md shadow-brutal-lg">
        <CardHeader className="text-center">
          <Link href="/marketplace" className="mx-auto mb-3" aria-label="Home">
            <LogoMark className="h-12 w-16 text-lg" />
          </Link>
          <CardTitle className="font-display text-3xl font-extrabold">
            {title}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-stretch">{body}</CardContent>
      </Card>
    </div>
  );
}
