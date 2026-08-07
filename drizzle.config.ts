import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js uses .env.local; drizzle-kit only auto-loads .env unless we do this
config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Add it to .env.local (see .env.example)."
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
