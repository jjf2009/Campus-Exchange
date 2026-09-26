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

  const nextParam = url.searchParams.get("next") ?? "/marketplace";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/marketplace";
  // Relative redirect: in dev, request.url reports "localhost" even when the
  // browser used 127.0.0.1, which would drop the cookie set below.
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: next },
  });

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

