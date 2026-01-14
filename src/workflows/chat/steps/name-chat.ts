import { db } from "@/lib/db/client";
import { chats } from "@/lib/chat/schema";
import { getChatMessages } from "@/lib/chat/queries";
import { eq } from "drizzle-orm";
import type { ChatAgentUIMessage } from "../types";

/**
 * Helper to extract text content from UIMessage parts
 */
function getTextFromMessage(msg: ChatAgentUIMessage): string {
  if (!msg.parts || msg.parts.length === 0) return "";
  const texts: string[] = [];
  for (const part of msg.parts) {
    if (part.type === "text" && "text" in part) {
      texts.push(part.text);
    }
  }
  return texts.join("");
}

/**
 * Generate a title for the chat from the first user message.
 * Only runs if the chat doesn't have a custom title yet.
 */
export async function nameChatStep(
  chatId: string,
  userMessage: ChatAgentUIMessage,
): Promise<void> {
  "use step";

  // Check if this is the first message in the chat
  const existingMessages = await getChatMessages(chatId);

  // Only name if this is the first message (just the user message we added)
  if (existingMessages.length > 2) {
    return;
  }

  // Get the chat to check current title
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });

  // Skip if chat has a non-default title
  if (chat && chat.title !== "New chat") {
    return;
  }

  // Generate title from first user message
  const text = getTextFromMessage(userMessage);
  const title = text.slice(0, 100) || "New chat";

  await db
    .update(chats)
    .set({ title, updatedAt: new Date() })
    .where(eq(chats.id, chatId));
}
