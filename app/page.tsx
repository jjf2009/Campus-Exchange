import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/marketplace");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Only for Goa College of Engineering
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Buy & sell campus essentials{" "}
              <span className="text-primary">the GEC way</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {APP_NAME} connects seniors with juniors for boilers, drafters,
              calculators, books, and hostel gear — no online payments, just
              a WhatsApp chat.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" render={<Link href="/login" />} nativeButton={false}>
              Continue with Google
                  <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" render={<Link href="/login" />} nativeButton={false}>
              Browse Marketplace
            </Button>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
            <Feature
              icon={<BookOpen className="h-5 w-5" />}
              title="List in minutes"
              description="Snap a photo, set a price, and publish to the campus marketplace."
            />
            <Feature
              icon={<MessageCircle className="h-5 w-5" />}
              title="Chat instantly"
              description="Tap Chat on WhatsApp and message the seller straight away. No waiting for approval."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Trusted campus only"
              description="Only @gec.ac.in accounts can sign in, and stale listings are hidden automatically."
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Built for what GEC students actually sell
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              "Boiler",
              "Bomber",
              "Drafter",
              "Calculator",
              "Books",
              "Laptop",
              "Hostel Chair",
              "Drawing Kit",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm font-medium shadow-sm"
              >
                <Calculator className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
