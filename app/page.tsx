import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageCircle, Search, Handshake } from "lucide-react";
import { Marquee, Sticker } from "@/components/brand";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getLandingStats } from "@/db/queries/listings";
import { getCurrentUser } from "@/lib/auth";
import {
  APP_NAME,
  CATEGORIES,
  CATEGORY_EMOJI,
  getCategoryImage,
} from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";

const FALLBACK_TICKER = [
  "Drafter · ₹600",
  "Boiler suit · ₹450",
  "Casio fx-991 · ₹700",
  "Hostel mattress · ₹900",
  "Table fan · ₹500",
];

async function loadStats() {
  try {
    return await getLandingStats();
  } catch (error) {
    console.error("Landing stats unavailable:", error);
    return { live: 0, sold: 0, recent: [] };
  }
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/marketplace");
  }

  const stats = await loadStats();
  const ticker =
    stats.recent.length >= 3
      ? stats.recent.map((l) => `${l.title} · ${formatPrice(l.price)}`)
      : FALLBACK_TICKER;

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative bg-grid">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
            <div className="animate-pop-in">
              <Sticker color="pink" tilt={-3} className="mb-6">
                ★ Only for Goa College of Engineering
              </Sticker>
              <h1 className="font-display text-[3.2rem] leading-[0.92] font-extrabold tracking-tight sm:text-7xl lg:text-[5.5rem]">
                Seniors sell.
                <br />
                <span className="marker">Juniors save.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg font-medium text-muted-foreground sm:text-xl">
                Boilers, drafters, calculators, mattresses: grab last
                year&apos;s gear for a fraction of the price. One tap and
                you&apos;re chatting with the senior on WhatsApp.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="xl"
                  variant="lime"
                  render={<Link href="/login" />}
                  nativeButton={false}
                >
                  Start browsing
                  <ArrowRight className="size-5" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  render={<Link href="/login?next=/new-listing" />}
                  nativeButton={false}
                >
                  Sell your stuff
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Sticker color="paper" tilt={2}>
                  ₹0 fees
                </Sticker>
                <Sticker color="sun" tilt={-2}>
                  No bargaining by email
                </Sticker>
                <Sticker color="paper" tilt={3}>
                  @gec.ac.in only
                </Sticker>
              </div>
            </div>

            {/* Polaroid stack */}
            <div className="relative mx-auto hidden h-[440px] w-full max-w-md sm:block">
              <HeroCard
                category="Drafter"
                title="Mini drafter"
                price={600}
                className="top-4 left-0 -rotate-6"
              />
              <HeroCard
                category="Calculator"
                title="Casio fx-991ES"
                price={700}
                className="top-24 right-0 rotate-6"
              />
              <HeroCard
                category="Boiler"
                title="Boiler suit (M)"
                price={450}
                className="bottom-0 left-16 -rotate-2"
              />
              <Sticker
                color="pink"
                tilt={12}
                wiggle
                className="absolute top-0 right-6 z-20 text-base"
              >
                🔥 5 want this
              </Sticker>
            </div>
          </div>
        </section>

        <Marquee items={ticker.map((t) => `Just listed: ${t}`)} />

        {/* STATS */}
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:grid-cols-3">
          <StatBlock
            value={stats.live > 0 ? String(stats.live) : "New"}
            label={stats.live > 0 ? "items live right now" : "drops every week"}
            className="bg-lime"
          />
          <StatBlock
            value={stats.sold > 0 ? String(stats.sold) : "₹1000s"}
            label={
              stats.sold === 1
                ? "deal done on campus"
                : stats.sold > 1
                  ? "deals done on campus"
                  : "saved by juniors"
            }
            className="bg-sun"
          />
          <StatBlock value="1 tap" label="to chat with the seller" className="bg-pink" />
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y-2 border-ink bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <Step
                n={1}
                icon={<Search className="size-6" />}
                title="Find it"
                body="Search by what you need: boiler, drafter, calculator, fan."
              />
              <Step
                n={2}
                icon={<MessageCircle className="size-6" />}
                title="Tap WhatsApp"
                body="A message about the item is already typed. Just hit send."
              />
              <Step
                n={3}
                icon={<Handshake className="size-6" />}
                title="Meet on campus"
                body="Canteen, library, hostel gate. Check it, pay, done."
              />
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              What&apos;s on the shelf
            </h2>
            <Sticker color="lime" tilt={-3}>
              Built for GEC
            </Sticker>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((c) => c !== "Others").map((category) => (
              <Link
                key={category}
                href={`/marketplace?category=${category}`}
                className="group overflow-hidden rounded-xl border-2 border-ink bg-card shadow-brutal press"
              >
                <div className="relative aspect-[4/3] border-b-2 border-ink bg-muted">
                  <Image
                    src={getCategoryImage(category)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 font-display font-bold">
                  <span>{category}</span>
                  <span aria-hidden>{CATEGORY_EMOJI[category]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t-2 border-ink bg-lime">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="max-w-xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Your senior&apos;s drafter is waiting.
            </h2>
            <Button
              size="xl"
              variant="ink"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Join {APP_NAME}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function HeroCard({
  category,
  title,
  price,
  className,
}: {
  category: string;
  title: string;
  price: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute w-56 rounded-xl border-2 border-ink bg-card p-2.5 shadow-brutal-lg ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-ink bg-muted">
        <Image
          src={getCategoryImage(category)}
          alt=""
          fill
          sizes="224px"
          className="object-cover"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="truncate font-display font-bold">{title}</span>
        <Sticker color="lime" tilt={-4} className="text-xs">
          {formatPrice(price)}
        </Sticker>
      </div>
    </div>
  );
}

function StatBlock({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border-2 border-ink p-6 text-ink shadow-brutal ${className}`}
    >
      <p className="font-display text-5xl font-extrabold tracking-tight">
        {value}
      </p>
      <p className="mt-1 font-semibold">{label}</p>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-xl border-2 border-ink bg-card p-6 text-ink shadow-brutal-lg">
      <span className="absolute -top-5 -left-3 flex size-11 -rotate-6 items-center justify-center rounded-lg border-2 border-ink bg-sun font-display text-xl font-extrabold">
        {n}
      </span>
      <div className="mb-3 flex justify-end text-primary">{icon}</div>
      <h3 className="font-display text-2xl font-extrabold">{title}</h3>
      <p className="mt-2 font-medium text-muted-foreground">{body}</p>
    </div>
  );
}
