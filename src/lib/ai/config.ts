import { configSchema, server } from "@/lib/config/schema";

// AI Gateway configuration
// The AI SDK automatically uses this key when model is specified as a string
export const aiConfig = configSchema("AI", {
  gatewayApiKey: server({ env: "AI_GATEWAY_API_KEY" }),
});
