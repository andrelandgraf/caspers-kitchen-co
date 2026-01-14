"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@workflow/ai";
import { v7 as uuidv7 } from "uuid";
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
import type { ChatAgentUIMessage } from "@/lib/chat/types";

const suggestedPrompts = [
  "What's on the menu?",
  "Add Nashville Hot Chicken Sandwich to my cart",
  "What locations do you have?",
  "Place my order",
];

type ChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const [chatId, setChatId] = useState<string>(() => uuidv7());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRunIdRef = useRef<string | undefined>(undefined);

  // Memoize transport to prevent recreation on every render
  const transport = useMemo(
    () =>
      new WorkflowChatTransport({
        // Send new messages
        prepareSendMessagesRequest: ({ messages }) => ({
          api: `/api/chats/${chatId}/messages`,
          body: {
            chatId,
            message: messages[messages.length - 1],
          },
        }),

        // Store the workflow run ID when a message is sent
        onChatSendMessage: (response) => {
          const workflowRunId = response.headers.get("x-workflow-run-id");
          if (workflowRunId) {
            activeRunIdRef.current = workflowRunId;
          }
        },

        // Configure reconnection to use the ref for the latest value
        prepareReconnectToStreamRequest: ({ api, ...rest }) => {
          const currentRunId = activeRunIdRef.current;
          if (!currentRunId) {
            throw new Error("No active workflow run ID found for reconnection");
          }
          return {
            ...rest,
            api: `/api/chats/${chatId}/messages/${encodeURIComponent(currentRunId)}/stream`,
          };
        },

        // Clear the workflow run ID when the chat stream ends
        onChatEnd: () => {
          activeRunIdRef.current = undefined;
        },

        // Retry up to 5 times on reconnection errors
        maxConsecutiveErrors: 5,
      }),
    [chatId],
  );

  const { messages, sendMessage, status, setMessages } =
    useChat<ChatAgentUIMessage>({
      transport,
      id: chatId,
      generateId: () => uuidv7(),
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
    setChatId(uuidv7());
    activeRunIdRef.current = undefined;
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
      toolCallId?: string;
      args?: unknown;
      result?: unknown;
      output?: unknown;
      state?: string;
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
          // Skip step markers
          if (part.type === "step-start") {
            return null;
          }

          // Handle text parts (including streaming)
          if (part.type === "text") {
            if (!part.text) return null; // Skip empty text during streaming
            return (
              <p
                key={index}
                className="text-sm leading-relaxed whitespace-pre-wrap"
              >
                {part.text}
              </p>
            );
          }

          // Handle tool parts - check state property for completed tools
          // State can be "call", "partial-call", or "result" (also check for output-available)
          const isToolResult =
            part.type.startsWith("tool-") &&
            (part.state === "result" ||
              part.state === "output-available" ||
              (part.result !== undefined && part.result !== null));

          if (isToolResult) {
            const toolName = part.type.replace("tool-", "");
            const output = (part.result ?? part.output) as Record<
              string,
              unknown
            >;

            // Render menu items
            if (toolName === "getMenu" && output?.items) {
              return <MenuItemsDisplay key={index} output={output} />;
            }

            // Render recommendations
            if (toolName === "getRecommendations" && output?.recommendations) {
              return <RecommendationsDisplay key={index} output={output} />;
            }

            // Render cart
            if (toolName === "getCart" && output) {
              return <CartDisplay key={index} output={output} />;
            }

            // Render add to cart confirmation
            if (toolName === "addToCart" && output) {
              return <AddToCartDisplay key={index} output={output} />;
            }

            // Render locations
            if (toolName === "getLocations" && output?.locations) {
              return <LocationsDisplay key={index} output={output} />;
            }

            // Render user location
            if (toolName === "getUserLocation" && output) {
              return <UserLocationDisplay key={index} output={output} />;
            }

            // Render set location
            if (toolName === "setUserLocation" && output) {
              return <SetLocationDisplay key={index} output={output} />;
            }

            // Render order status
            if (toolName === "getOrderStatus" && output) {
              return <OrderStatusDisplay key={index} output={output} />;
            }

            // Render user orders
            if (toolName === "getUserOrders" && output) {
              return <UserOrdersDisplay key={index} output={output} />;
            }

            // Render place order confirmation
            if (toolName === "placeOrder" && output) {
              return <PlaceOrderDisplay key={index} output={output} />;
            }

            // Default: just show indicator for other tools
            return (
              <div
                key={index}
                className="text-xs text-muted-foreground/70 italic mt-1 flex items-center gap-1"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                {formatToolName(toolName)}
              </div>
            );
          }

          // Handle tool in progress - state is "call" or "partial-call" or no result yet
          const isToolInProgress =
            part.type.startsWith("tool-") &&
            !isToolResult &&
            (part.state === "call" ||
              part.state === "partial-call" ||
              part.state === undefined);

          if (isToolInProgress) {
            const toolName = part.type.replace("tool-", "");
            return (
              <div
                key={index}
                className="text-xs text-muted-foreground/70 italic mt-1 flex items-center gap-1"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                Looking up {formatToolName(toolName)}...
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  category: string;
  dietary: string[];
  featured?: boolean;
};

function MenuItemsDisplay({ output }: { output: Record<string, unknown> }) {
  const items = output.items as MenuItem[];
  const hasMore = output.hasMore as boolean;
  const totalItems = output.totalItems as number;

  return (
    <div className="mt-2 space-y-2">
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-2 rounded-lg bg-background/50 border border-border/30"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm truncate">
                    {item.name}
                  </span>
                  {item.featured && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
                {item.dietary.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.dietary.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-primary whitespace-nowrap">
                {item.price}
              </span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {items.length} of {totalItems} items
        </p>
      )}
    </div>
  );
}

function RecommendationsDisplay({
  output,
}: {
  output: Record<string, unknown>;
}) {
  const recommendations = output.recommendations as Array<{
    id: string;
    name: string;
    description?: string;
    price: string;
    reason?: string;
  }>;

  return (
    <div className="mt-2 space-y-2">
      {recommendations.map((item) => (
        <div
          key={item.id}
          className="p-2 rounded-lg bg-background/50 border border-border/30"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <span className="font-medium text-sm">{item.name}</span>
              {item.reason && (
                <span className="text-[10px] ml-1.5 text-muted-foreground">
                  {item.reason}
                </span>
              )}
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            <span className="text-sm font-medium text-primary">
              {item.price}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CartDisplay({ output }: { output: Record<string, unknown> }) {
  if (output.empty) {
    return (
      <p className="text-sm text-muted-foreground mt-1">
        {output.message as string}
      </p>
    );
  }

  const items = output.items as Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;

  return (
    <div className="mt-2 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center text-sm p-2 rounded-lg bg-background/50 border border-border/30"
        >
          <span>
            {item.quantity}x {item.name}
          </span>
          <span className="font-medium text-primary">{item.totalPrice}</span>
        </div>
      ))}
      <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-border/30">
        <span>Subtotal</span>
        <span className="text-primary">{output.subtotal as string}</span>
      </div>
    </div>
  );
}

function AddToCartDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.success) {
    return (
      <p className="text-sm text-destructive mt-1">
        {output.message as string}
      </p>
    );
  }

  const cartItem = output.cartItem as {
    name: string;
    quantity: number;
    unitPrice: string;
  };

  return (
    <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600">Added to cart:</span>
        <span className="font-medium">
          {cartItem.quantity}x {cartItem.name}
        </span>
        <span className="text-muted-foreground">({cartItem.unitPrice})</span>
      </div>
    </div>
  );
}

function LocationsDisplay({ output }: { output: Record<string, unknown> }) {
  const locations = output.locations as Array<{
    id: string;
    name: string;
    city: string;
    address: string;
    isOpen: boolean;
    deliveryFee: string;
  }>;

  return (
    <div className="mt-2 space-y-2">
      {locations.map((location) => (
        <div
          key={location.id}
          className="p-2 rounded-lg bg-background/50 border border-border/30"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{location.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    location.isOpen
                      ? "bg-green-500/20 text-green-600"
                      : "bg-red-500/20 text-red-600",
                  )}
                >
                  {location.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {location.address}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {location.deliveryFee} delivery
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserLocationDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.found) {
    return (
      <p className="text-sm text-muted-foreground mt-1">
        {output.message as string}
      </p>
    );
  }

  const location = output.location as {
    name: string;
    address: string;
    city: string;
    isOpen: boolean;
    deliveryFee: string;
  };

  return (
    <div className="mt-2 p-2 rounded-lg bg-background/50 border border-border/30">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Your location:</span>
        <span className="font-medium">{location.name}</span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            location.isOpen
              ? "bg-green-500/20 text-green-600"
              : "bg-red-500/20 text-red-600",
          )}
        >
          {location.isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{location.address}</p>
    </div>
  );
}

function SetLocationDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.success) {
    return (
      <p className="text-sm text-destructive mt-1">
        {output.message as string}
      </p>
    );
  }

  const location = output.location as {
    name: string;
    city: string;
  };

  return (
    <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span>Location set to:</span>
        <span className="font-medium">{location.name}</span>
      </div>
    </div>
  );
}

function OrderStatusDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.found) {
    return (
      <p className="text-sm text-muted-foreground mt-1">
        {output.message as string}
      </p>
    );
  }

  const order = output.order as {
    orderNumber: string;
    status: string;
    total: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    estimatedDelivery?: string;
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-600",
    confirmed: "bg-blue-500/20 text-blue-600",
    preparing: "bg-orange-500/20 text-orange-600",
    ready: "bg-green-500/20 text-green-600",
    out_for_delivery: "bg-purple-500/20 text-purple-600",
    delivered: "bg-green-500/20 text-green-600",
    cancelled: "bg-red-500/20 text-red-600",
  };

  return (
    <div className="mt-2 p-2 rounded-lg bg-background/50 border border-border/30 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">Order {order.orderNumber}</span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full capitalize",
            statusColors[order.status] || "bg-muted text-muted-foreground",
          )}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>
      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span className="text-muted-foreground">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-border/30">
        <span>Total</span>
        <span className="text-primary">{order.total}</span>
      </div>
      {order.estimatedDelivery && (
        <p className="text-xs text-muted-foreground">
          ETA: {order.estimatedDelivery}
        </p>
      )}
    </div>
  );
}

function UserOrdersDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.success) {
    return (
      <p className="text-sm text-muted-foreground mt-1">
        {output.message as string}
      </p>
    );
  }

  const orders = output.orders as Array<{
    orderNumber: string;
    status: string;
    total: string;
    itemCount: number;
    createdAt: string;
  }>;

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mt-1">
        {output.message as string}
      </p>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-600",
    confirmed: "bg-blue-500/20 text-blue-600",
    preparing: "bg-orange-500/20 text-orange-600",
    ready: "bg-green-500/20 text-green-600",
    out_for_delivery: "bg-purple-500/20 text-purple-600",
    delivered: "bg-green-500/20 text-green-600",
    cancelled: "bg-red-500/20 text-red-600",
  };

  return (
    <div className="mt-2 space-y-2">
      {orders.map((order) => (
        <div
          key={order.orderNumber}
          className="p-2 rounded-lg bg-background/50 border border-border/30"
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{order.orderNumber}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full capitalize",
                    statusColors[order.status] ||
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.itemCount} items &bull; {order.createdAt}
              </p>
            </div>
            <span className="font-medium text-sm text-primary">
              {order.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaceOrderDisplay({ output }: { output: Record<string, unknown> }) {
  if (!output.success) {
    return (
      <p className="text-sm text-destructive mt-1">
        {output.message as string}
      </p>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-green-600">Order Placed!</p>
        <p className="text-lg font-bold">{output.orderNumber as string}</p>
        <p className="text-xs text-muted-foreground">
          {output.message as string}
        </p>
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
    // Menu tools
    getMenu: "menu",
    getMenuItemDetails: "item details",
    checkAllergens: "allergen info",
    getRecommendations: "recommendations",
    // Location tools
    getLocations: "locations",
    getUserLocation: "your location",
    setUserLocation: "setting location",
    getBusinessHours: "business hours",
    getEstimatedDeliveryTime: "delivery estimate",
    // Cart tools
    getCart: "your cart",
    addToCart: "adding to cart",
    updateCartItem: "updating cart",
    removeFromCart: "removing from cart",
    clearCart: "clearing cart",
    // Order tools
    getOrderStatus: "order status",
    getUserOrders: "your orders",
    placeOrder: "placing order",
    cancelOrder: "cancelling order",
  };
  return names[toolName] ?? toolName;
}
