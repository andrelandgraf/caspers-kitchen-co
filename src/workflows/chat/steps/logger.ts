type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Workflow-safe logger step.
 * Uses console methods since pino uses Node.js modules (fs, events, worker_threads)
 * that are not available in the workflow runtime.
 */
export async function log(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
): Promise<void> {
  "use step";

  const timestamp = new Date().toISOString();
  const logMessage = data
    ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(data)}`
    : `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "debug":
      console.debug(logMessage);
      break;
    default:
      console.log(logMessage);
  }
}
