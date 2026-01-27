import { publishEvent } from "./client";

type EventSource = "ui" | "ai";

interface EventMetadata {
  userId?: string;
  sessionId?: string;
  source: EventSource;
}

export async function trackCartItemAdded(
  metadata: EventMetadata & {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    unitPrice: string;
  },
) {
  const { userId, sessionId, source, ...payload } = metadata;
  await publishEvent({
    event_type: "cart_item_added",
    timestamp: Date.now(),
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    source,
    payload: JSON.stringify(payload),
  });
}

export async function trackCartItemUpdated(
  metadata: EventMetadata & {
    cartItemId: string;
    menuItemName: string;
    previousQuantity: number;
    newQuantity: number;
  },
) {
  const { userId, sessionId, source, ...payload } = metadata;
  await publishEvent({
    event_type: "cart_item_updated",
    timestamp: Date.now(),
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    source,
    payload: JSON.stringify(payload),
  });
}

export async function trackCartItemRemoved(
  metadata: EventMetadata & {
    cartItemId: string;
    menuItemName?: string;
  },
) {
  const { userId, sessionId, source, ...payload } = metadata;
  await publishEvent({
    event_type: "cart_item_removed",
    timestamp: Date.now(),
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    source,
    payload: JSON.stringify(payload),
  });
}

export async function trackOrderCreated(
  metadata: EventMetadata & {
    orderId: string;
    orderNumber: string;
    total: string;
    itemCount: number;
    locationId: string;
    paymentMethod: string;
  },
) {
  const { userId, sessionId, source, ...payload } = metadata;
  await publishEvent({
    event_type: "order_created",
    timestamp: Date.now(),
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    source,
    payload: JSON.stringify(payload),
  });
}
