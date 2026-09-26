import Link from "next/link";
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
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";

export const metadata = {
  title: "New Listing",
};

export default async function NewListingPage() {
  const user = await requireCompleteProfile();
  const notifications = await getNavbarNotifications(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          render={<Link href="/marketplace" />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-3xl font-extrabold">Sell your stuff 💸</CardTitle>
            <CardDescription>
              List equipment, books, or hostel gear for fellow GEC students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm mode="create" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
