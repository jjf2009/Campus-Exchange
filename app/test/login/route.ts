import { NextResponse } from "next/server";
import { E2E_TEST_COOKIE, isE2ETestMode } from "@/lib/e2e";

export async function GET(request: Request) {
  if (!isE2ETestMode()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const next = url.searchParams.get("next") ?? "/";
  const response = NextResponse.redirect(new URL(next, url.origin));

  response.cookies.set(
    E2E_TEST_COOKIE,
    JSON.stringify({ email }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    }
  );

  return response;
}

