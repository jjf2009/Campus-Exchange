import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingForm } from "@/components/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";

export const metadata = {
  title: "Edit Listing — GEC Exchange",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const notifications = await getNavbarNotifications(user.id);

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (!listing || listing.status === "ARCHIVED") {
    notFound();
  }

  if (listing.sellerId !== user.id) {
    redirect("/");
  }

  if (listing.status === "SOLD") {
    redirect(`/listing/${id}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground"
          render={<Link href={`/listing/${id}`} />}
          nativeButton={false}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to listing
        </Button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit listing</h1>
          <p className="mt-2 text-muted-foreground">
            Update details for &ldquo;{listing.title}&rdquo;.
          </p>
        </div>

        {/* Form in a clean surface */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <ListingForm mode="edit" listing={listing} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
