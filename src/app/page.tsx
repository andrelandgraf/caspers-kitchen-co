"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSelector } from "@/components/themes/selector";
import { Send, ChefHat, Sparkles } from "lucide-react";

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">
                Caspers Kitchen
              </h1>
              <p className="text-xs text-muted-foreground">Ghost Kitchen Co.</p>
            </div>
          </div>
          <ThemeSelector />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by Databricks
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome to <span className="text-primary">Caspers Kitchen</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered ghost kitchen assistant. Ask about our menu, place
            orders, or get personalized food recommendations.
          </p>
        </section>

        {/* Chat Interface */}
        <Card className="max-w-3xl mx-auto shadow-lg border-border/50">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <ChefHat className="h-4 w-4 text-primary" />
              </div>
              Kitchen Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <ChefHat className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">
                    Start a conversation with our AI kitchen assistant.
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    Ask about our menu, dietary options, or place an order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.parts.map((part, index) =>
                          part.type === "text" ? (
                            <p key={index} className="text-sm leading-relaxed">
                              {part.text}
                            </p>
                          ) : null,
                        )}
                      </div>
                    </div>
                  ))}
                  {status === "streaming" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-2.5">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <form
              onSubmit={handleSubmit}
              className="border-t border-border/50 p-4 flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== "ready"}
                placeholder="Ask about our menu..."
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={status !== "ready" || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <section className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg">🍕</span>
                </div>
                Browse Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore our diverse menu with options for every taste and
                dietary preference.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg">⚡</span>
                </div>
                Quick Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Place orders instantly through our AI assistant with smart
                recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg">📊</span>
                </div>
                Data Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Powered by Databricks for real-time analytics and personalized
                experiences.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Caspers Kitchen Co. - A Databricks Demo Application</p>
          <p className="mt-1 text-xs opacity-70">
            Built with Next.js, Neon, and AI SDK
          </p>
        </div>
      </footer>
    </div>
  );
}
