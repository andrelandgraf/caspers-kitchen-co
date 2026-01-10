"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Send, ChefHat, X, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "What's on the menu?",
  "Do you have vegetarian options?",
  "What are your hours?",
  "Track my order",
];

type ChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
      headers: {},
    }),
    onResponse: (response) => {
      const newConversationId = response.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }
    },
  });

  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleSuggestion = (prompt: string) => {
    if (status === "ready") {
      sendMessage({ text: prompt });
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const isStreaming = status === "streaming";
  const isLoading = status !== "ready";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-base">Casper</SheetTitle>
                <SheetDescription className="text-xs">
                  Kitchen Assistant
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleNewConversation}
                  title="New conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div ref={scrollRef} className="p-4 min-h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col h-full">
                {/* Welcome message */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    Welcome to Caspers Kitchen
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    I can help you browse the menu, check dietary options, track
                    orders, and more. What can I help you with?
                  </p>
                </div>

                {/* Suggested prompts */}
                <div className="mt-auto pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Try asking:
                  </p>
                  <div className="grid gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestion(prompt)}
                        disabled={isLoading}
                        className="text-left px-4 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-colors text-sm disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border/50 p-4 flex gap-2 bg-background flex-shrink-0"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about our menu..."
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type MessageBubbleProps = {
  message: {
    id: string;
    role: string;
    parts?: Array<{
      type: string;
      text?: string;
      toolName?: string;
      result?: unknown;
    }>;
  };
};

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {message.parts?.map((part, index) => {
          if (part.type === "text" && part.text) {
            return (
              <p
                key={index}
                className="text-sm leading-relaxed whitespace-pre-wrap"
              >
                {part.text}
              </p>
            );
          }
          if (part.type === "tool-invocation" && part.toolName) {
            return (
              <div
                key={index}
                className="text-xs text-muted-foreground/70 italic mt-1 flex items-center gap-1"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                Looking up {formatToolName(part.toolName)}...
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5">
      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
      <span
        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

function formatToolName(toolName: string): string {
  const names: Record<string, string> = {
    getMenu: "menu",
    getMenuItemDetails: "item details",
    checkAllergens: "allergen info",
    getBusinessHours: "business hours",
    getOrderStatus: "order status",
    getEstimatedDeliveryTime: "delivery estimate",
    getRecommendations: "recommendations",
  };
  return names[toolName] ?? toolName;
}
