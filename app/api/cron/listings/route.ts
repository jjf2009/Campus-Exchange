import { and, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { EXPIRE_AFTER_DAYS, HOLD_EXPIRES_AFTER_DAYS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Daily job (vercel.json). No notifications, two quiet rules:
 * 1. Holds end after HOLD_EXPIRES_AFTER_DAYS: items the seller didn't mark
 *    sold go back on the marketplace (the deal probably fell through).
 * 2. Live listings nobody has touched in EXPIRE_AFTER_DAYS are hidden, for
 *    items sold outside the app. The seller can relist from the dashboard.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();

  // Runs first: relisting resets last_confirmed_at, so these don't expire.
  const relisted = await db
    .update(listings)
    .set({
      status: "AVAILABLE",
      heldByUserId: null,
      heldAt: null,
      lastConfirmedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(listings.status, "RESERVED"),
        lt(listings.heldAt, new Date(now - HOLD_EXPIRES_AFTER_DAYS * DAY))
      )
    )
    .returning({ id: listings.id });

  const expired = await db
    .update(listings)
    .set({ status: "EXPIRED", updatedAt: new Date() })
    .where(
      and(
        eq(listings.status, "AVAILABLE"),
        lt(listings.lastConfirmedAt, new Date(now - EXPIRE_AFTER_DAYS * DAY))
      )
    )
    .returning({ id: listings.id });

  return NextResponse.json(
    { relisted: relisted.length, expired: expired.length },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
