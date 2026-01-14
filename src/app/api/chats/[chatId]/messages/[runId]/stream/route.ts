import { headers } from "next/headers";
import { getRun } from "workflow/api";
import { createUIMessageStreamResponse } from "ai";
import { auth } from "@/lib/auth/server";
import { verifyChatOwnership } from "@/lib/chat/queries";

export const maxDuration = 120; // 2 minutes for resuming longer conversations

/**
 * GET /api/chats/:chatId/messages/:runId/stream
 * Resume endpoint for workflow streams
 *
 * Query params:
 *   - startIndex: optional chunk index to resume from
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string; runId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const { chatId, runId } = await params;

  if (!runId) {
    return new Response("Missing runId parameter", { status: 400 });
  }

  // For authenticated users, verify chat ownership
  if (userId) {
    const isAuthorized = await verifyChatOwnership(chatId, userId);
    if (!isAuthorized) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const startIndexParam = searchParams.get("startIndex");
  const startIndex =
    startIndexParam !== null ? parseInt(startIndexParam, 10) : undefined;

  const run = await getRun(runId);
  const readable = await run.getReadable({ startIndex });

  return createUIMessageStreamResponse({
    stream: readable,
  });
}
