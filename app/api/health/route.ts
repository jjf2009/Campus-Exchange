import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/health/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const report = await getHealthReport();
    const statusCode = report.status === "healthy" ? 200 : 503;

    return NextResponse.json(report, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Health check: unexpected failure", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version ?? "0.0.0",
        environment:
          process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        services: {
          database: "unhealthy",
          storage: "unhealthy",
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
