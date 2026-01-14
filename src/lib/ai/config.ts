import { configSchema, server, oneOf } from "@/lib/config/schema";
import { createGateway } from "@ai-sdk/gateway";

const config = configSchema(
  "AI",
  {
    oidcToken: server({ env: "VERCEL_OIDC_TOKEN", optional: true }),
    gatewayApiKey: server({ env: "AI_GATEWAY_API_KEY", optional: true }),
  },
  {
    constraints: (s) => [oneOf([s.oidcToken, s.gatewayApiKey])],
  },
);

const gateway = createGateway({
  apiKey: config.server.gatewayApiKey || config.server.oidcToken,
});

export const aiConfig = {
  ...config,
  getModel: (model: string) => gateway(model),
};
