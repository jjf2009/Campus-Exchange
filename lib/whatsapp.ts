import { getAppUrl } from "@/lib/app-url";
import { HOLD_EXPIRES_AFTER_DAYS } from "@/lib/constants";
import { formatPrice } from "@/utils/formatPrice";

/** Phones are stored as 10-digit Indian numbers; wa.me needs the country code. */
export function buildWhatsAppUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.length === 10 ? `91${digits}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${international}${query}`;
}

/**
 * Pre-filled first message from buyer to seller. Tapping Chat on WhatsApp
 * puts the item on hold, so the message tells the seller how to undo that.
 */
export function buildListingEnquiry(listing: {
  id: string;
  title: string;
  price: number;
}) {
  const appUrl = getAppUrl();
  return [
    `Hi! I'm interested in your ${listing.title} (${formatPrice(listing.price)}) on GEC Exchange.`,
    `${appUrl}/listing/${listing.id}`,
    "",
    "📌 GEC Exchange has hidden this item while we talk.",
    `If it sells, mark it sold here. Otherwise it comes back on the marketplace in ${HOLD_EXPIRES_AFTER_DAYS} days (or relist it sooner from the same link):`,
    `${appUrl}/listing/${listing.id}/relist`,
  ].join("\n");
}
