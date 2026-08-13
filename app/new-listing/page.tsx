import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ListingForm } from "@/components/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";

export const metadata = {
  title: "Sell an item — GEC Exchange",
  description: "List your used campus gear for fellow GEC students to find.",
};

export default async function NewListingPage() {
  const user = await requireCompleteProfile();
  const notifications = await getNavbarNotifications(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground"
          render={<Link href="/" />}
          nativeButton={false}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to marketplace
        </Button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Sell an item</h1>
          <p className="mt-2 text-muted-foreground">
            List it in under a minute. Buyers request — you choose who to contact via WhatsApp.
          </p>
        </div>

        {/* Form in a clean surface */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <ListingForm mode="create" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
