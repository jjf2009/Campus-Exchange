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
  reserved?: boolean;
  lastConfirmedAt?: Date | string;
  contactCount?: number;
}

export function ListingCard({
  id,
  title,
  price,
  category,
  condition,
  imageUrl,
  sellerName,
  createdAt,
  reserved = false,
  lastConfirmedAt,
  contactCount = 0,
}: ListingCardProps) {
  const displayImage =
    imageUrl && imageUrl.startsWith("/")
      ? imageUrl
      : getCategoryImage(category);

  return (
    <Link href={`/listing/${id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          <SafeImage
            src={displayImage}
            alt={title}
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {reserved ? (
            <Badge className="absolute left-2 top-2 border-amber-200 bg-amber-100 text-amber-800">
              Reserved
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
              {title}
            </h3>
            <span className="shrink-0 font-bold text-primary">
              {formatPrice(price)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {category}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {condition}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {sellerName ? (
              <span>
                {sellerName}
                {contactCount > 0 ? ` · ${contactCount} interested` : ""}
              </span>
            ) : (
              <span />
            )}
            <span>
              {lastConfirmedAt
                ? `Confirmed ${formatRelativeDate(lastConfirmedAt)}`
                : formatRelativeDate(createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
