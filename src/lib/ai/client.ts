// AI SDK automatically uses Vercel AI Gateway when model is specified as a string
// The gateway looks for AI_GATEWAY_API_KEY environment variable by default

// Export the model identifier for use with streamText/generateText
// When passed as a string, AI SDK routes through Vercel AI Gateway
export const MODEL_ID = "anthropic/claude-sonnet-4.5" as const;
