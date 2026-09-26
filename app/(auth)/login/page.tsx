import Link from "next/link";
import { signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ALLOWED_EMAIL_DOMAIN, APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/marketplace";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
          >
            GEC
          </Link>
          <CardTitle className="text-2xl">Welcome to {APP_NAME}</CardTitle>
          <CardDescription>
            Sign in with your @{ALLOWED_EMAIL_DOMAIN} Google account to buy and
            sell campus essentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {params.error === "domain"
                ? `Please sign in with your @${ALLOWED_EMAIL_DOMAIN} college account.`
                : "Sign-in failed. Please try again."}
            </p>
          ) : null}
          <form
            action={async () => {
              "use server";
              await signInWithGoogle(next);
            }}
          >
            <Button type="submit" size="lg" className="w-full">
              <GoogleIcon />
              Continue with Google
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree this marketplace is for GEC students and
            that payments happen offline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
