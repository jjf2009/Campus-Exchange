import { NextResponse } from "next/server";
import { isE2ETestMode } from "@/lib/e2e";

declare global {
  // eslint-disable-next-line no-var
  var __E2E_EMAIL_EVENTS__:
    | Array<{
        to: string;
        subject: string;
        html: string;
        createdAt: string;
      }>
    | undefined;
}

export async function GET() {
  if (!isE2ETestMode()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  return NextResponse.json({
    count: globalThis.__E2E_EMAIL_EVENTS__?.length ?? 0,
    events: globalThis.__E2E_EMAIL_EVENTS__ ?? [],
  });
}

export async function DELETE() {
  if (!isE2ETestMode()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  globalThis.__E2E_EMAIL_EVENTS__ = [];
  return NextResponse.json({ ok: true });
}

