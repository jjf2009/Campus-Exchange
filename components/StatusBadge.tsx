import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/types";

const listingStyles: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-lime text-ink",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-sun text-ink",
  },
  SOLD: {
    label: "Sold",
    className: "bg-ink text-paper",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
  EXPIRED: {
    label: "Hidden",
    className: "bg-pink text-ink",
  },
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const style = listingStyles[status];
  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  );
}
