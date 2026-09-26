import { Footer } from "@/components/Footer";
import { DashboardNav } from "@/components/DashboardNav";
import { Navbar } from "@/components/Navbar";
import { Sticker } from "@/components/brand";
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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Hey {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 font-medium text-muted-foreground">
              Your listings, interested buyers and profile.
            </p>
          </div>
          <Sticker color="sun" tilt={3}>
            Seller HQ
          </Sticker>
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
