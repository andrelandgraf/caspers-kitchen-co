import { convertToModelMessages, streamText, UIMessage } from "ai";
import { MODEL_ID } from "@/lib/ai/client";
import { kitchenTools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import {
  createConversation,
  createMessages,
  getConversationWithMessages,
} from "@/lib/chat/queries";
import type { MessagePart } from "@/lib/chat/schema";

export const maxDuration = 30;

const systemPrompt = `You are a friendly and helpful AI assistant for Caspers Kitchen, a modern ghost kitchen. Your name is Casper.

Your capabilities:
- Help customers browse the menu and find items that match their preferences
- Answer questions about ingredients, allergens, and dietary options
- Provide personalized food recommendations
- Check order status and estimated delivery times
- Share business hours and availability information

Guidelines:
- Be warm, conversational, and helpful
- Use the available tools to provide accurate, real-time information
- When suggesting menu items, mention prices and highlight popular or dietary-relevant options
- If asked about something outside your capabilities (like actually placing orders or processing payments), politely explain that feature is coming soon and suggest alternatives
- Keep responses concise but informative
- If a customer has dietary restrictions or allergies, always use the tools to verify ingredients

Remember: You're representing Caspers Kitchen, so maintain a friendly, professional tone that makes customers feel welcome.`;

// Helper to extract text content from UIMessage parts
function getTextFromMessage(msg: UIMessage): string {
  if (!msg.parts || msg.parts.length === 0) return "";
  const textParts = msg.parts.filter(
    (p): p is { type: "text"; text: string } =>
      p.type === "text" && "text" in p && typeof p.text === "string",
  );
  return textParts.map((p) => p.text).join("");
}

// Helper to convert UIMessage parts to database MessagePart format
function convertToDbParts(parts: UIMessage["parts"]): MessagePart[] {
  if (!parts) return [];
  return parts
    .map((p): MessagePart | null => {
      if (p.type === "text" && "text" in p) {
        return { type: "text", text: p.text };
      }
      if (p.type.startsWith("tool-") && "toolCallId" in p) {
        return {
          type: "tool-invocation",
          toolInvocationId: p.toolCallId,
          toolName: "toolName" in p ? String(p.toolName) : "unknown",
          args: "input" in p ? p.input : undefined,
          result: "output" in p ? p.output : undefined,
        };
      }
      return null;
    })
    .filter((p): p is MessagePart => p !== null);
}

export async function POST(req: Request) {
  const {
    messages,
    conversationId,
  }: { messages: UIMessage[]; conversationId?: string } = await req.json();

  // Get current user session
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  // Handle conversation persistence
  let activeConversationId = conversationId;
  let existingMessages: UIMessage[] = [];

  if (activeConversationId) {
    // Load existing conversation
    const conversation =
      await getConversationWithMessages(activeConversationId);
    if (conversation) {
      existingMessages = conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        parts: msg.parts?.map((p) => {
          if (p.type === "text") {
            return { type: "text" as const, text: p.text };
          }
          if (p.type === "tool-invocation") {
            return {
              type: "tool-result" as const,
              toolCallId: p.toolInvocationId,
              toolName: p.toolName,
              state: "output-available" as const,
              input: p.args,
              output: p.result,
            };
          }
          return { type: "text" as const, text: "" };
        }) ?? [{ type: "text" as const, text: msg.content }],
        createdAt: msg.createdAt,
      }));
    }
  } else if (messages.length > 0) {
    // Create new conversation with the first message
    const firstUserMessage = messages.find((m) => m.role === "user");
    const title = firstUserMessage
      ? getTextFromMessage(firstUserMessage).slice(0, 100) || "New conversation"
      : "New conversation";

    const conversation = await createConversation({
      id: crypto.randomUUID(),
      title,
      userId: userId ?? null,
    });
    activeConversationId = conversation.id;
  }

  // Combine existing messages with new ones for context
  const allMessages = [
    ...existingMessages,
    ...messages.filter((m) => !existingMessages.some((e) => e.id === m.id)),
  ];

  // Save new user messages to the database
  const newUserMessages = messages.filter(
    (m) => m.role === "user" && !existingMessages.some((e) => e.id === m.id),
  );

  if (newUserMessages.length > 0 && activeConversationId) {
    await createMessages(
      newUserMessages.map((m) => {
        const textContent = getTextFromMessage(m);
        const dbParts = convertToDbParts(m.parts);

        return {
          id: m.id,
          conversationId: activeConversationId!,
          role: "user" as const,
          content: textContent || "...",
          parts:
            dbParts.length > 0
              ? dbParts
              : [{ type: "text" as const, text: textContent }],
        };
      }),
    );
  }

  // Note: Tools are temporarily disabled due to a schema compatibility issue
  // with the Vercel AI Gateway. The gateway expects tools.input_schema.type
  // to be present, but the AI SDK's Zod-to-JSON-schema conversion may not
  // include it. Re-enable when using a direct provider like @ai-sdk/anthropic.
  const result = streamText({
    model: MODEL_ID,
    system: systemPrompt,
    messages: await convertToModelMessages(allMessages),
    // tools: kitchenTools,
    // maxSteps: 5,
    onFinish: async ({ response }) => {
      // Save assistant response to database
      if (activeConversationId && response.messages) {
        const assistantMessages = response.messages.filter(
          (m) => m.role === "assistant",
        );

        for (const msg of assistantMessages) {
          // Handle both string and array content
          const content = msg.content;
          let textContent = "";
          let dbParts: MessagePart[] = [];

          if (typeof content === "string") {
            textContent = content;
            dbParts = [{ type: "text", text: content }];
          } else if (Array.isArray(content)) {
            textContent = content
              .filter(
                (c): c is { type: "text"; text: string } => c.type === "text",
              )
              .map((c) => c.text)
              .join("");

            dbParts = content.map((c): MessagePart => {
              if (c.type === "text") {
                return { type: "text", text: c.text };
              }
              if (c.type === "tool-call") {
                return {
                  type: "tool-invocation",
                  toolInvocationId: c.toolCallId,
                  toolName: c.toolName,
                  args: c.input,
                };
              }
              return { type: "text", text: "" };
            });
          }

          if (textContent) {
            await createMessages([
              {
                id: crypto.randomUUID(),
                conversationId: activeConversationId,
                role: "assistant" as const,
                content: textContent,
                parts: dbParts,
              },
            ]);
          }
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    headers: {
      "X-Conversation-Id": activeConversationId ?? "",
    },
  });
}
