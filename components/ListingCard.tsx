import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/utils/formatPrice";
import { formatRelativeDate } from "@/utils/formatDate";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  imageUrl: string | null;
  sellerName?: string;
  createdAt: Date | string;
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
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 opacity-40" />
            </div>
          )}
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
            {sellerName ? <span>{sellerName}</span> : <span />}
            <span>{formatRelativeDate(createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
