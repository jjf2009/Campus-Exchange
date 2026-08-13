import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { ShieldCheck, Lock, Users } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Set up your profile — GEC Exchange",
  description:
    "Complete your profile to access the GEC campus marketplace.",
};

export default async function ProfileSetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (isProfileComplete(user)) redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-warm-tint">
      {/* Minimal header — no full Navbar needed here */}
      <header className="border-b bg-background px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            GEC
          </div>
          <span className="font-semibold text-foreground">{APP_NAME}</span>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-xl">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="text-sm font-medium text-primary mb-1">
              Almost there — one last step
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Set up your profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              This lets sellers know who&apos;s requesting their item — and lets
              buyers find you after you accept.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <ProfileForm user={user} redirectTo="/" />
          </div>

          {/* Trust signals below form */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <TrustNote
              icon={<ShieldCheck className="h-4 w-4" />}
              text="GEC students only"
            />
            <TrustNote
              icon={<Lock className="h-4 w-4" />}
              text="WhatsApp shared only on accept"
            />
            <TrustNote
              icon={<Users className="h-4 w-4" />}
              text="Peer-to-peer, no payments"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function TrustNote({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{text}</p>
    </div>
  );
}
