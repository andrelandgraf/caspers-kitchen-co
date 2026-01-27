import { z } from "zod";
import { configSchema, server } from "@/lib/config/schema";

export const databricksConfig = configSchema("Databricks", {
  workspaceUrl: server({
    env: "DATABRICKS_WORKSPACE_URL",
    schema: z.string().url(),
    optional: true,
  }),
  clientId: server({ env: "DATABRICKS_CLIENT_ID", optional: true }),
  clientSecret: server({ env: "DATABRICKS_CLIENT_SECRET", optional: true }),
  zerobusTable: server({ env: "DATABRICKS_ZEROBUS_TABLE", optional: true }),
  zerobusEndpoint: server({
    env: "DATABRICKS_ZEROBUS_ENDPOINT",
    schema: z.string().url(),
    optional: true,
  }),
});
