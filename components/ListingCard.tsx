import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { Sticker } from "@/components/brand";
import { CATEGORY_EMOJI, getCategoryImage } from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";
import { formatRelativeDate } from "@/utils/formatDate";
import type { Category } from "@/types";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  imageUrl?: string | null;
  sellerName?: string;
  createdAt: Date | string;
  lastConfirmedAt?: Date | string;
}

const NEW_FOR_MS = 48 * 60 * 60 * 1000;

export function ListingCard({
  id,
  title,
  price,
  category,
  condition,
  imageUrl,
  sellerName,
  createdAt,
  lastConfirmedAt,
}: ListingCardProps) {
  const displayImage =
    imageUrl && imageUrl.startsWith("/")
      ? imageUrl
      : getCategoryImage(category);
  const isNew = Date.now() - new Date(createdAt).getTime() < NEW_FOR_MS;
  const emoji = CATEGORY_EMOJI[category as Category] ?? "📦";

  return (
    <Link
      href={`/listing/${id}`}
      className="group block h-full rounded-xl border-2 border-ink bg-card shadow-brutal press focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[10px] border-b-2 border-ink bg-muted">
        <SafeImage
          src={displayImage}
          alt={title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isNew ? (
          <div className="absolute top-2 left-2">
            <Sticker color="lime" tilt={-5} className="text-xs">
              NEW
            </Sticker>
          </div>
        ) : null}
        <div className="absolute right-2 bottom-2">
          <Sticker
            color="paper"
            tilt={-4}
            className="text-lg transition-transform group-hover:rotate-0"
          >
            {formatPrice(price)}
          </Sticker>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg leading-tight font-bold">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          <span className="rounded-md border-2 border-ink bg-muted px-1.5 py-0.5">
            {emoji} {category}
          </span>
          <span className="rounded-md border-2 border-ink px-1.5 py-0.5">
            {condition}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <span className="truncate font-medium">{sellerName ?? ""}</span>
          <span className="shrink-0">
            {lastConfirmedAt
              ? `✓ ${formatRelativeDate(lastConfirmedAt)}`
              : formatRelativeDate(createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
