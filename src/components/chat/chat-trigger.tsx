"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "./chat-panel";

export function ChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
      </Button>

      {/* Chat panel */}
      <ChatPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
