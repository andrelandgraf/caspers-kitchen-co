import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  json,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "@/lib/auth/schema";

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
  "tool",
]);

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("conversations_userId_idx").on(table.userId),
    index("conversations_updatedAt_idx").on(table.updatedAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    // Store additional message parts (tool calls, attachments, etc.)
    parts: json("parts").$type<MessagePart[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversationId_idx").on(table.conversationId),
    index("messages_createdAt_idx").on(table.createdAt),
  ],
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// Type for message parts (text, tool calls, etc.)
export type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "tool-invocation";
      toolInvocationId: string;
      toolName: string;
      args: unknown;
      result?: unknown;
    }
  | {
      type: "source";
      sourceType: string;
      id: string;
      url?: string;
      title?: string;
    };

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
