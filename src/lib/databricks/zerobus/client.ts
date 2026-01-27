import { ZerobusSdk, ZerobusStream } from "@databricks/zerobus-ingest-sdk";
import { databricksConfig } from "../config";

// RecordType.Json = 0, RecordType.Proto = 1
const RECORD_TYPE_JSON = 0;

function isConfigured(): boolean {
  const {
    zerobusEndpoint,
    workspaceUrl,
    zerobusTable,
    clientId,
    clientSecret,
  } = databricksConfig.server;
  return !!(
    zerobusEndpoint &&
    workspaceUrl &&
    zerobusTable &&
    clientId &&
    clientSecret
  );
}

let streamPromise: Promise<ZerobusStream | null> | null = null;

async function createStream(): Promise<ZerobusStream | null> {
  if (!isConfigured()) {
    return null;
  }

  const {
    zerobusEndpoint,
    workspaceUrl,
    zerobusTable,
    clientId,
    clientSecret,
  } = databricksConfig.server;

  const sdk = new ZerobusSdk(zerobusEndpoint!, workspaceUrl!);
  const stream = await sdk.createStream(
    { tableName: zerobusTable! },
    clientId!,
    clientSecret!,
    { recordType: RECORD_TYPE_JSON },
  );
  return stream;
}

function getStream() {
  if (!streamPromise) {
    streamPromise = createStream();
  }
  return streamPromise;
}

export async function publishEvent(event: Record<string, unknown>) {
  const stream = await getStream();
  if (!stream) {
    // SDK not available - silently skip
    return;
  }
  await stream.ingestRecord(event);
}

export async function publishEvents(events: Record<string, unknown>[]) {
  const stream = await getStream();
  if (!stream) {
    // SDK not available - silently skip
    return;
  }
  for (const event of events) {
    await stream.ingestRecord(event);
  }
  await stream.flush();
}
