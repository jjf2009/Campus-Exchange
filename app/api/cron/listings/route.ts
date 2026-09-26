import { and, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { EXPIRE_AFTER_DAYS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Daily job (vercel.json). Quiet safety net for sellers who sold an item
 * outside the app: live listings nobody has touched in EXPIRE_AFTER_DAYS are
 * hidden. No notifications; the seller can renew from their dashboard.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await db
    .update(listings)
    .set({ status: "EXPIRED", updatedAt: new Date() })
    .where(
      and(
        eq(listings.status, "AVAILABLE"),
        lt(listings.lastConfirmedAt, new Date(Date.now() - EXPIRE_AFTER_DAYS * DAY))
      )
    )
    .returning({ id: listings.id });

  return NextResponse.json(
    { expired: expired.length },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
