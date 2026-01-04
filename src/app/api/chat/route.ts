import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system:
      "You are a helpful assistant for Caspers Kitchen, a ghost kitchen. Help customers with their food orders and questions.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
