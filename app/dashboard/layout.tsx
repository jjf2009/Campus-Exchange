import { Footer } from "@/components/Footer";
import { DashboardNav } from "@/components/DashboardNav";
import { Navbar } from "@/components/Navbar";
import { requireCompleteProfile } from "@/lib/auth";
import { getNavbarNotifications } from "@/lib/notifications/notification-service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCompleteProfile();
  const notifications = await getNavbarNotifications(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} notifications={notifications} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your listings, requests, and profile.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          <DashboardNav />
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
