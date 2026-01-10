import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  conversations,
  messages,
  type NewConversation,
  type NewMessage,
} from "./schema";

export async function getConversation(id: string) {
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getConversationWithMessages(id: string) {
  const conversation = await getConversation(id);
  if (!conversation) return null;

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  return { ...conversation, messages: msgs };
}

export async function getUserConversations(userId: string, limit = 20) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function createConversation(data: NewConversation) {
  const result = await db.insert(conversations).values(data).returning();
  return result[0];
}

export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function deleteConversation(id: string, userId?: string) {
  const where = userId
    ? and(eq(conversations.id, id), eq(conversations.userId, userId))
    : eq(conversations.id, id);

  await db.delete(conversations).where(where);
}

export async function getMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createMessage(data: NewMessage) {
  const result = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return result[0];
}

export async function createMessages(data: NewMessage[]) {
  if (data.length === 0) return [];

  const result = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt timestamp
  const conversationId = data[0].conversationId;
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return result;
}
