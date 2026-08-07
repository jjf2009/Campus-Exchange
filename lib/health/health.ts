import { checkDatabase, type ServiceStatus } from "@/lib/health/database";
import { checkStorage } from "@/lib/health/storage";
import packageJson from "@/package.json";

export type OverallStatus = "healthy" | "unhealthy";

export interface HealthServices {
  database: ServiceStatus;
  storage: ServiceStatus;
}

export interface HealthReport {
  status: OverallStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: HealthServices;
}

function resolveEnvironment(): string {
  return (
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

function resolveVersion(): string {
  return process.env.npm_package_version ?? packageJson.version ?? "0.0.0";
}

export async function getHealthReport(): Promise<HealthReport> {
  const [database, storage] = await Promise.all([
    checkDatabase(),
    checkStorage(),
  ]);

  const services: HealthServices = { database, storage };
  const allHealthy = Object.values(services).every(
    (status) => status === "healthy"
  );

  return {
    status: allHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: resolveVersion(),
    environment: resolveEnvironment(),
    services,
  };
}
