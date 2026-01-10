import { start, getRun } from "workflow/api";
import * as workflows from "@/workflows/kitchen-assistant";
import type { ModelMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: ModelMessage[] } = await req.json();

  try {
    const run = await start(workflows.kitchenAssistantWorkflow, [messages]);

    return Response.json({
      runId: run.id,
      status: run.status,
    });
  } catch (err) {
    console.error("Failed to start workflow:", err);
    return Response.json(
      { error: "Failed to start workflow" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const runId = url.searchParams.get("runId");

  if (!runId) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  try {
    const run = await getRun(runId);

    if (!run) {
      return Response.json({ error: "Run not found" }, { status: 404 });
    }

    return Response.json({
      runId: run.id,
      status: run.status,
      output: run.output,
    });
  } catch (err) {
    console.error("Failed to get workflow run:", err);
    return Response.json(
      { error: "Failed to get workflow run" },
      { status: 500 },
    );
  }
}
