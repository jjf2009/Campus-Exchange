import Link from "next/link";
import { signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { ShieldCheck, Lock, Users } from "lucide-react";

export const metadata = {
  title: "Login — GEC Exchange",
  description: "Sign in to buy and sell used academic gear with fellow Goa College of Engineering students.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";

  return (
    <div className="flex min-h-screen flex-col bg-warm-tint">
      {/* Minimal Header */}
      <header className="border-b bg-background px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              GEC
            </div>
            <span className="font-semibold text-foreground">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo / Tagline */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              GEC
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buy and sell lab gear, books, and hostel essentials within GEC.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            {params.error ? (
              <div
                className="mb-5 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-center text-sm text-destructive"
                role="alert"
              >
                Sign-in failed. Please use your student account.
              </div>
            ) : null}

            <form
              action={async () => {
                "use server";
                await signInWithGoogle(next);
              }}
            >
              <Button type="submit" size="lg" className="w-full gap-2">
                <GoogleIcon />
                Continue with Google
              </Button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
              Secure authentication via Google. We only access your basic details
              (name, email) to verify your GEC identity.
            </p>
          </div>

          {/* Quick Features / Trust Notes */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <TrustNote
              icon={<ShieldCheck className="h-4 w-4" />}
              text="Verified GEC Students"
            />
            <TrustNote
              icon={<Lock className="h-4 w-4" />}
              text="WhatsApp Privacy"
            />
            <TrustNote
              icon={<Users className="h-4 w-4" />}
              text="Campus Handover"
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
      <p className="text-[11px] font-medium text-muted-foreground leading-tight">
        {text}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
