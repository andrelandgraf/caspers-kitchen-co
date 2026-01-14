// Tool type names for database schema
// Separated to avoid circular dependencies with db/client imports
export const TOOL_TYPES = [
  // Menu tools
  "tool-getMenu",
  "tool-getMenuItemDetails",
  "tool-checkAllergens",
  "tool-getRecommendations",
  // Location tools
  "tool-getLocations",
  "tool-getUserLocation",
  "tool-setUserLocation",
  "tool-getBusinessHours",
  "tool-getEstimatedDeliveryTime",
  // Cart tools
  "tool-getCart",
  "tool-addToCart",
  "tool-updateCartItem",
  "tool-removeFromCart",
  "tool-clearCart",
  // Order tools
  "tool-getOrderStatus",
  "tool-getUserOrders",
  "tool-placeOrder",
  "tool-cancelOrder",
] as const;

export type ToolType = (typeof TOOL_TYPES)[number];
