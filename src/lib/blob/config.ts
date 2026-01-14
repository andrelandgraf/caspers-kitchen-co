import { configSchema, server } from "@/lib/config/schema";

export const blobConfig = configSchema("Blob", {
  readWriteToken: server({ env: "BLOB_READ_WRITE_TOKEN" }),
});
