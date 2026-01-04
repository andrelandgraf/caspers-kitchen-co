import { loadEnvConfig } from "@next/env";

// Load .env.development (true = dev mode)
const { combinedEnv } = loadEnvConfig(process.cwd(), true);

import { defineConfig } from "drizzle-kit";

const databaseUrl = combinedEnv.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in .env.development");
}

export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
