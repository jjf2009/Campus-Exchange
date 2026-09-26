import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingForm } from "@/components/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { requireCompleteProfile } from "@/lib/auth";

export const metadata = {
  title: "Edit Listing",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (!listing || listing.status === "ARCHIVED") {
    notFound();
  }

  if (listing.sellerId !== user.id) {
    redirect("/marketplace");
  }

  if (listing.status === "SOLD") {
    redirect(`/listing/${id}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          render={<Link href={`/listing/${id}`} />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listing
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-3xl font-extrabold">Edit listing</CardTitle>
            <CardDescription>
              Update details for {listing.title}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm mode="edit" listing={listing} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
