import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const client = postgres(
  connectionString ?? "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  {
    prepare: false,
    max: 10,
    // Don't hang forever when DB is unreachable during build/dev setup
    connect_timeout: 5,
  }
);

export const db = drizzle(client, { schema });
