import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rotated "GEC" sticker used as the logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-12 -rotate-6 items-center justify-center rounded-md border-2 border-ink bg-lime font-display text-sm font-extrabold tracking-tight text-ink shadow-brutal-sm",
        className
      )}
    >
      GEC
    </span>
  );
}

const stickerColors = {
  lime: "bg-lime text-ink",
  pink: "bg-pink text-ink",
  sun: "bg-sun text-ink",
  blue: "bg-primary text-primary-foreground",
  ink: "bg-ink text-paper",
  paper: "bg-card text-ink",
} as const;

/** A slightly rotated label with a hard shadow. */
export function Sticker({
  children,
  color = "lime",
  tilt = -4,
  wiggle = false,
  className,
}: {
  children: ReactNode;
  color?: keyof typeof stickerColors;
  tilt?: number;
  wiggle?: boolean;
  className?: string;
}) {
  return (
    <span
      style={{ "--tilt": `${tilt}deg`, rotate: `${tilt}deg` } as CSSProperties}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-2 border-ink px-2.5 py-1 font-display text-sm font-extrabold whitespace-nowrap shadow-brutal-sm",
        stickerColors[color],
        wiggle && "animate-wiggle",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Infinite horizontal ticker. Items are rendered twice for a seamless loop. */
export function Marquee({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8">
          {item}
          <span aria-hidden className="text-xl">
            ✺
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={cn(
        "overflow-hidden border-y-2 border-ink bg-ink py-3 text-paper",
        className
      )}
    >
      <div className="flex w-max animate-marquee font-display text-base font-bold uppercase tracking-wide sm:text-lg">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
