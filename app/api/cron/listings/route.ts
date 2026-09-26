import { and, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { VISIBLE_STATUSES } from "@/db/queries/listings";
import {
  EXPIRE_AFTER_DAYS,
  NUDGE_AFTER_CONTACT_HOURS,
  NUDGE_AFTER_DAYS,
} from "@/lib/constants";
import {
  sendConfirmAvailabilityEmail,
  sendListingExpiredEmail,
} from "@/lib/email";
import { createNotification } from "@/lib/notifications/notification-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Touched = { id: string; sellerId: string; title: string };

async function getSellers(rows: Touched[]) {
  if (rows.length === 0) return new Map<string, { email: string; name: string }>();
  const sellers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(inArray(users.id, [...new Set(rows.map((r) => r.sellerId))]));
  return new Map(sellers.map((s) => [s.id, s]));
}

/**
 * Daily job (vercel.json) that keeps the marketplace honest:
 * 1. Hide listings nobody has confirmed in EXPIRE_AFTER_DAYS.
 * 2. Ask sellers "still available?" when a listing is getting old, or when
 *    buyers contacted them NUDGE_AFTER_CONTACT_HOURS ago. Each listing is
 *    nudged once until the seller answers (nudged_at).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const live = inArray(listings.status, [...VISIBLE_STATUSES]);

  const expired: Touched[] = await db
    .update(listings)
    .set({ status: "EXPIRED", updatedAt: new Date() })
    .where(
      and(
        live,
        lt(listings.lastConfirmedAt, new Date(now - EXPIRE_AFTER_DAYS * DAY))
      )
    )
    .returning({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
    });

  const contactCutoff = new Date(now - NUDGE_AFTER_CONTACT_HOURS * HOUR);
  const nudged: Touched[] = await db
    .update(listings)
    .set({ nudgedAt: new Date() })
    .where(
      and(
        live,
        isNull(listings.nudgedAt),
        or(
          lt(listings.lastConfirmedAt, new Date(now - NUDGE_AFTER_DAYS * DAY)),
          sql`exists (
            select 1 from listing_contacts lc
            where lc.listing_id = ${listings.id}
              and lc.created_at > ${listings.lastConfirmedAt}
              and lc.created_at < ${contactCutoff.toISOString()}
          )`
        )
      )
    )
    .returning({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
    });

  const sellers = await getSellers([...expired, ...nudged]);

  // Notification/email failures shouldn't stop the rest of the batch.
  const results = await Promise.allSettled([
    ...expired.flatMap((l) => {
      const seller = sellers.get(l.sellerId);
      return [
        createNotification({
          userId: l.sellerId,
          type: "LISTING_EXPIRED",
          title: `${l.title} was hidden`,
          message: `${l.title} hasn't been confirmed as available in ${EXPIRE_AFTER_DAYS} days, so it's hidden. Renew it if it's still for sale.`,
          data: { href: "/dashboard", listingId: l.id },
        }),
        seller
          ? sendListingExpiredEmail({
              to: seller.email,
              sellerName: seller.name,
              listingTitle: l.title,
            })
          : Promise.resolve(),
      ];
    }),
    ...nudged.flatMap((l) => {
      const seller = sellers.get(l.sellerId);
      return [
        createNotification({
          userId: l.sellerId,
          type: "CONFIRM_AVAILABILITY",
          title: `Is ${l.title} still available?`,
          message: `Tap Sold, Reserved or Still available so buyers know.`,
          data: { href: "/dashboard", listingId: l.id },
        }),
        seller
          ? sendConfirmAvailabilityEmail({
              to: seller.email,
              sellerName: seller.name,
              listingTitle: l.title,
            })
          : Promise.resolve(),
      ];
    }),
  ]);

  const failures = results.filter((r) => r.status === "rejected");
  for (const failure of failures) {
    console.error("Listings cron: notify failed", failure.reason);
  }

  return NextResponse.json(
    { expired: expired.length, nudged: nudged.length, failures: failures.length },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
