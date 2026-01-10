import { start, getRun } from "workflow/api";
import {
  processOrderWorkflow,
  cancelOrderWorkflow,
} from "@/workflows/order-processing";

export async function POST(req: Request) {
  const { action, order, orderId, reason } = await req.json();

  try {
    if (action === "process") {
      if (!order) {
        return Response.json({ error: "Order is required" }, { status: 400 });
      }

      const run = await start(processOrderWorkflow, [order]);

      return Response.json({
        runId: run.id,
        status: run.status,
        message: "Order processing started",
      });
    }

    if (action === "cancel") {
      if (!orderId) {
        return Response.json({ error: "orderId is required" }, { status: 400 });
      }

      const run = await start(cancelOrderWorkflow, [
        orderId,
        reason || "Customer requested",
      ]);

      return Response.json({
        runId: run.id,
        status: run.status,
        message: "Order cancellation started",
      });
    }

    return Response.json(
      { error: "Invalid action. Use 'process' or 'cancel'" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Failed to start order workflow:", err);
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
      return Response.json(
        { error: "Workflow run not found" },
        { status: 404 },
      );
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
