import { headers, cookies } from "next/headers";
import { ensureChatExists } from "@/lib/chat/queries";
import { auth } from "@/lib/auth/server";
import { chatWorkflow } from "@/workflows/chat";
import { start } from "workflow/api";
import { createUIMessageStreamResponse } from "ai";
import type { ChatAgentUIMessage } from "@/workflows/chat/types";

export const maxDuration = 120; // 2 minutes for longer agent conversations

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id ?? null;
  const { chatId } = await params;

  const { message } = (await request.json()) as {
    message: ChatAgentUIMessage;
  };

  if (!message) {
    return new Response("Missing message", { status: 400 });
  }

  // Ensure chat exists (create if needed) and verify ownership
  const isAuthorized = await ensureChatExists(chatId, userId);
  if (!isAuthorized) {
    return new Response("Forbidden", { status: 403 });
  }

  // Get session ID from cookies for guest cart access
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session_id")?.value;

  // Start workflow with user message
  const run = await start(chatWorkflow, [
    {
      chatId,
      userMessage: message,
      toolContext: {
        userId: userId ?? undefined,
        sessionId,
      },
    },
  ]);

  // Return stream with runId for resumability
  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: {
      "x-workflow-run-id": run.runId,
    },
  });
}
