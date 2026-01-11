#!/usr/bin/env bun

import { spawn } from "bun";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const FINISH_SIGNAL = "FINISHED ALL FEATURE WORK";
const PERMISSION_WAIT_SIGNALS = [
  "waiting for permission",
  "need your permission",
  "waiting for file write permission",
  "Would you like me to proceed",
];
const MAX_PERMISSION_RETRIES = 2;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const promptPath = join(scriptDir, "prompt.md");

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    prompt: { type: "string" },
  },
});

type RunResult = {
  finished: boolean;
  waitingForPermission: boolean;
};

async function runClaude(): Promise<RunResult> {
  const baselinePrompt = await Bun.file(promptPath).text();

  const prompt = values.prompt
    ? `Follow this correction/override prompt: ${values.prompt} -\n\nBaseline prompt: ${baselinePrompt}`
    : baselinePrompt;

  const escapedPrompt = prompt.replace(/'/g, "'\\''");

  const proc = spawn({
    cmd: [
      "sh",
      "-c",
      `dbexec repo run llm agent claude -- --print --dangerously-skip-permissions --verbose '${escapedPrompt}'`,
    ],
    stdout: "pipe",
    stderr: "inherit",
  });

  let output = "";

  const reader = proc.stdout.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    output += chunk;
    process.stdout.write(chunk);

    if (output.includes(FINISH_SIGNAL)) {
      console.log("\n\n[runner] Detected finish signal. Exiting...");
      proc.kill();
      return { finished: true, waitingForPermission: false };
    }
  }

  await proc.exited;

  if (output.includes(FINISH_SIGNAL)) {
    console.log("\n\n[runner] Detected finish signal. Exiting...");
    return { finished: true, waitingForPermission: false };
  }

  // Check if Claude is stuck waiting for permissions
  const isWaitingForPermission = PERMISSION_WAIT_SIGNALS.some((signal) =>
    output.toLowerCase().includes(signal.toLowerCase()),
  );

  return { finished: false, waitingForPermission: isWaitingForPermission };
}

async function main() {
  console.log("[runner] Starting Ralph agent loop...\n");

  let iteration = 1;
  let permissionRetries = 0;

  while (true) {
    console.log(`\n[runner] === Iteration ${iteration} ===\n`);

    const result = await runClaude();

    if (result.finished) {
      console.log("[runner] All feature work completed!");
      process.exit(0);
    }

    if (result.waitingForPermission) {
      permissionRetries++;
      console.log(
        `\n[runner] ⚠️  Detected permission wait (${permissionRetries}/${MAX_PERMISSION_RETRIES})`,
      );

      if (permissionRetries >= MAX_PERMISSION_RETRIES) {
        console.error(
          "\n[runner] ❌ Ralph is stuck waiting for permissions despite --dangerously-skip-permissions flag.",
        );
        console.error(
          "[runner] This suggests a configuration issue. Please investigate.",
        );
        process.exit(1);
      }

      console.log(
        "[runner] Retrying with explicit permission bypass instructions...\n",
      );
    } else {
      // Reset retry counter if not a permission issue
      permissionRetries = 0;
    }

    iteration++;
    console.log("\n[runner] Restarting claude...\n");
  }
}

main().catch((err) => {
  console.error("[runner] Error:", err);
  process.exit(1);
});
