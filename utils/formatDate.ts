import { formatDistanceToNow, format } from "date-fns";

function toValidDate(date: Date | string): Date | null {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export function formatRelativeDate(date: Date | string): string {
  const d = toValidDate(date);
  if (!d) return "Unknown date";
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "Unknown date";
  }
}

export function formatFullDate(date: Date | string): string {
  const d = toValidDate(date);
  if (!d) return "Unknown date";
  try {
    return format(d, "MMM d, yyyy");
  } catch {
    return "Unknown date";
  }
}
