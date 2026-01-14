import {
  streamText,
  convertToModelMessages,
  type FinishReason,
  type UIMessage,
  type UIMessageChunk,
  type ModelMessage,
} from "ai";
import type { ProviderOptions } from "@ai-sdk/provider-utils";
import { aiConfig } from "./config";
import { createKitchenTools, type ToolContext } from "./tools";

type MessagePart = UIMessage["parts"][number];

export type ToolsKey = "kitchen";

/**
 * Serializable stream options (excludes callbacks like onFinish).
 */
export interface StreamOptions {
  sendStart?: boolean;
  sendFinish?: boolean;
  sendReasoning?: boolean;
  sendSources?: boolean;
}

/**
 * Serializable options for streamText (excludes callbacks and messages).
 */
export interface StepOptions {
  model: string;
  system: string;
  /** Tool set key - resolved to actual tools inside the step executor */
  tools: ToolsKey;
  providerOptions?: ProviderOptions;
}

/**
 * All properties must be serializable for workflow compatibility.
 */
export interface AgentConfig {
  stepOptions: StepOptions;
  streamOptions?: StreamOptions;
}

export interface AgentRunConfig {
  /** @default 10 */
  maxSteps?: number;
  /** Pass getWritable() in workflows, or any WritableStream outside */
  writable?: WritableStream<UIMessageChunk>;
  /** Tool context for user-specific operations (cart, orders) */
  toolContext?: ToolContext;
}

export interface AgentRunResult {
  parts: MessagePart[];
  stepCount: number;
}

interface AgentStepResult {
  shouldContinue: boolean;
  responseMessage: UIMessage;
  finishReason: FinishReason;
}

interface StepExecutorConfig {
  stepOptions: StepOptions;
  streamOptions?: StreamOptions;
  writable?: WritableStream<UIMessageChunk>;
  toolContext?: ToolContext;
}

/**
 * AI agent that executes streamText in a tool loop.
 *
 * Configuration is fully serializable for workflow compatibility.
 * Tools are referenced by key and resolved inside the step executor.
 *
 * @example
 * ```ts
 * const chatAgent = new Agent({
 *   stepOptions: {
 *     model: "anthropic/claude-sonnet-4",
 *     system: "You are a helpful assistant...",
 *     tools: "kitchen",
 *   },
 *   streamOptions: { sendReasoning: false },
 * });
 *
 * const { parts } = await chatAgent.run(history, {
 *   maxSteps: 10,
 *   writable: getWritable(),
 *   toolContext: { userId, sessionId },
 * });
 * ```
 */
export class Agent {
  constructor(private config: AgentConfig) {}

  async run(
    history: UIMessage[],
    runConfig: AgentRunConfig = {},
  ): Promise<AgentRunResult> {
    const { maxSteps = 10, writable, toolContext } = runConfig;

    const stepConfig: StepExecutorConfig = {
      stepOptions: this.config.stepOptions,
      streamOptions: this.config.streamOptions,
      writable,
      toolContext,
    };

    let modelMessages: ModelMessage[] = await convertToModelMessages(history);
    let stepCount = 0;
    let shouldContinue = true;
    let allParts: MessagePart[] = [];

    while (shouldContinue && stepCount < maxSteps) {
      const result = await executeAgentStep(modelMessages, stepConfig);

      allParts = [...allParts, ...result.responseMessage.parts];
      modelMessages = [
        ...modelMessages,
        ...(await convertToModelMessages([result.responseMessage])),
      ];

      shouldContinue = result.shouldContinue;
      stepCount++;
    }

    return { parts: allParts, stepCount };
  }
}

/**
 * Get the tool set by key.
 * This function is called inside the step executor to resolve tools.
 */
function getToolSet(key: ToolsKey, context?: ToolContext) {
  switch (key) {
    case "kitchen":
      return createKitchenTools(context ?? {});
    default:
      throw new Error(`Unknown tool set: ${key}`);
  }
}

/**
 * Step executor with "use step" directive.
 * Separated from class because "use step" only works in standalone functions.
 * @internal
 */
async function executeAgentStep(
  messages: ModelMessage[],
  config: StepExecutorConfig,
): Promise<AgentStepResult> {
  "use step";

  const tools = getToolSet(config.stepOptions.tools, config.toolContext);

  const resultStream = streamText({
    model: aiConfig.getModel(config.stepOptions.model),
    system: config.stepOptions.system,
    tools,
    messages,
    providerOptions: config.stepOptions.providerOptions,
  });

  let responseMessage: UIMessage | null = null;

  const uiStream = resultStream.toUIMessageStream({
    sendStart: config.streamOptions?.sendStart ?? false,
    sendFinish: config.streamOptions?.sendFinish ?? false,
    sendReasoning: config.streamOptions?.sendReasoning ?? false,
    sendSources: config.streamOptions?.sendSources ?? false,
    onFinish: ({ responseMessage: msg }) => {
      responseMessage = msg;
    },
  });

  if (config.writable) {
    await pipeToWritable(uiStream, config.writable);
  } else {
    await consumeStream(uiStream);
  }

  await resultStream.consumeStream();
  const finishReason = await resultStream.finishReason;

  if (!responseMessage) {
    throw new Error("No response message received from stream");
  }

  const shouldContinue = finishReason === "tool-calls";

  return { shouldContinue, responseMessage, finishReason };
}

async function consumeStream<T>(stream: ReadableStream<T>): Promise<void> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

async function pipeToWritable<T>(
  readable: ReadableStream<T>,
  writable: WritableStream<T>,
): Promise<void> {
  const writer = writable.getWriter();
  const reader = readable.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }
  } finally {
    reader.releaseLock();
    writer.releaseLock();
  }
}

export function createAgent(config: AgentConfig): Agent {
  return new Agent(config);
}
