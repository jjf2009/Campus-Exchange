import { getAppUrl } from "@/lib/app-url";
import { formatPrice } from "@/utils/formatPrice";

/** Phones are stored as 10-digit Indian numbers; wa.me needs the country code. */
export function buildWhatsAppUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.length === 10 ? `91${digits}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${international}${query}`;
}

export function buildListingEnquiry(listing: {
  id: string;
  title: string;
  price: number;
}) {
  return `Hi! I saw your ${listing.title} (${formatPrice(listing.price)}) on GEC Exchange. Is it still available? ${getAppUrl()}/listing/${listing.id}`;
}
