import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/types";

const listingStyles: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  SOLD: {
    label: "Sold",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  EXPIRED: {
    label: "Hidden",
    className: "bg-red-100 text-red-800 border-red-200",
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
