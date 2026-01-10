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
        content: msg.content,
        parts: msg.parts ?? [{ type: "text" as const, text: msg.content }],
        createdAt: msg.createdAt,
      }));
    }
  } else if (messages.length > 0) {
    // Create new conversation with the first message
    const firstUserMessage = messages.find((m) => m.role === "user");
    const title = firstUserMessage
      ? typeof firstUserMessage.content === "string"
        ? firstUserMessage.content.slice(0, 100)
        : "New conversation"
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
        // Extract text content from parts or content
        let textContent = "";
        if (typeof m.content === "string") {
          textContent = m.content;
        } else if (m.parts) {
          textContent = m.parts
            .filter(
              (p): p is { type: "text"; text: string } =>
                p.type === "text" && typeof p.text === "string",
            )
            .map((p) => p.text)
            .join("");
        }

        return {
          id: m.id,
          conversationId: activeConversationId!,
          role: "user" as const,
          content: textContent || "...",
          parts: m.parts ?? [{ type: "text" as const, text: textContent }],
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
          const textContent = msg.content
            .filter(
              (c): c is { type: "text"; text: string } => c.type === "text",
            )
            .map((c) => c.text)
            .join("");

          if (textContent) {
            await createMessages([
              {
                id: crypto.randomUUID(),
                conversationId: activeConversationId,
                role: "assistant" as const,
                content: textContent,
                parts: msg.content.map((c) => {
                  if (c.type === "text") {
                    return { type: "text" as const, text: c.text };
                  }
                  if (c.type === "tool-call") {
                    return {
                      type: "tool-invocation" as const,
                      toolInvocationId: c.toolCallId,
                      toolName: c.toolName,
                      args: c.args,
                    };
                  }
                  return { type: "text" as const, text: "" };
                }),
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
