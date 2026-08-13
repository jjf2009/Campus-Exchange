import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryImage } from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";
import { formatRelativeDate } from "@/utils/formatDate";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  imageUrl?: string | null;
  sellerName?: string;
  createdAt: Date | string;
}

const conditionColor: Record<string, string> = {
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Like New": "bg-teal-50 text-teal-700 border-teal-200",
  Good: "bg-blue-50 text-blue-700 border-blue-200",
  Fair: "bg-amber-50 text-amber-700 border-amber-200",
  Poor: "bg-slate-50 text-slate-600 border-slate-200",
};

export function ListingCard({
  id,
  title,
  price,
  category,
  condition,
  imageUrl,
  sellerName,
  createdAt,
}: ListingCardProps) {
  const displayImage =
    imageUrl && imageUrl.startsWith("/")
      ? imageUrl
      : getCategoryImage(category);

  const conditionClass =
    conditionColor[condition] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <Link href={`/listing/${id}`} className="group block h-full" tabIndex={0}>
      <Card className="card-hover h-full overflow-hidden border bg-card">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <SafeImage
            src={displayImage}
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Price pill — overlaid bottom-right for instant scannability */}
          <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-background/90 px-2.5 py-1 text-sm font-bold text-primary shadow-sm backdrop-blur-sm">
            {formatPrice(price)}
          </div>
        </div>

        <CardContent className="space-y-2.5 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {category}
            </Badge>
            <Badge
              variant="outline"
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionClass}`}
            >
              {condition}
            </Badge>
          </div>

          {/* Footer meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {sellerName ? (
              <span className="truncate max-w-[120px]">{sellerName}</span>
            ) : (
              <span />
            )}
            <span className="shrink-0">{formatRelativeDate(createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
