import { tool } from "ai";
import { z } from "zod";
import {
  getMenuItems,
  getMenuItemBySlug,
  getMenuItemsByIds,
} from "@/lib/menu/queries";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "@/lib/cart/queries";
import {
  getOrder,
  getOrderByNumber,
  getUserOrders,
  createOrder,
  cancelOrder,
} from "@/lib/orders/queries";
import {
  getAllLocations,
  getLocationById,
  getUserLocation,
  setUserLocation,
  isLocationOpen,
} from "@/lib/locations/queries";
import {
  trackCartItemAdded,
  trackCartItemUpdated,
  trackCartItemRemoved,
  trackOrderCreated,
} from "@/lib/databricks/zerobus/events";

// Context passed from API route - userId and sessionId for cart/order operations
export interface ToolContext {
  userId?: string;
  sessionId?: string;
}

// Schema definitions
const getMenuSchema = z.object({
  category: z
    .enum(["mains", "sides", "desserts", "drinks", "all"])
    .optional()
    .describe("Category to filter by: mains, sides, desserts, drinks, or all"),
  dietary: z
    .enum(["vegetarian", "vegan", "gluten-free", "none"])
    .optional()
    .describe("Dietary preference: vegetarian, vegan, gluten-free, or none"),
  search: z.string().optional().describe("Search term for menu items"),
  limit: z.number().optional().describe("Maximum number of items to return"),
});

const getMenuItemDetailsSchema = z.object({
  itemSlug: z.string().describe("The slug of the menu item to look up"),
});

const checkAllergensSchema = z.object({
  itemSlug: z.string().describe("The menu item slug to check"),
  allergen: z
    .string()
    .describe(
      "The allergen to check for: gluten, dairy, nuts, eggs, soy, fish, or shellfish",
    ),
});

const getBusinessHoursSchema = z.object({
  locationId: z.string().optional().describe("Location ID to check hours for"),
  day: z
    .enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "today",
    ])
    .optional()
    .describe("Specific day to check"),
});

const getOrderStatusSchema = z.object({
  orderId: z.string().optional().describe("The order ID to look up"),
  orderNumber: z
    .string()
    .optional()
    .describe("The order number to look up (e.g., CK-20240110-1234)"),
});

const getEstimatedDeliveryTimeSchema = z.object({
  locationId: z.string().describe("Location ID to estimate delivery from"),
});

const getRecommendationsSchema = z.object({
  preference: z
    .enum(["popular", "vegetarian", "healthy", "quick"])
    .optional()
    .describe("Type of recommendation"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of recommendations to return"),
});

// Cart schemas
const addToCartSchema = z.object({
  menuItemId: z.string().describe("The ID of the menu item to add"),
  quantity: z.number().min(1).describe("Quantity to add"),
  customizations: z
    .string()
    .optional()
    .describe("JSON string of customization options"),
});

const updateCartItemSchema = z.object({
  cartItemId: z.string().describe("The ID of the cart item to update"),
  quantity: z.number().min(1).describe("New quantity"),
});

const removeFromCartSchema = z.object({
  cartItemId: z.string().describe("The ID of the cart item to remove"),
});

// Order schemas
const getUserOrdersSchema = z.object({
  limit: z.number().optional().describe("Maximum number of orders to return"),
});

const placeOrderSchema = z.object({
  deliveryAddress: z.string().describe("Street address for delivery"),
  deliveryCity: z.string().describe("City for delivery"),
  deliveryState: z.string().describe("State for delivery"),
  deliveryZip: z.string().describe("ZIP code for delivery"),
  deliveryInstructions: z
    .string()
    .optional()
    .describe("Special delivery instructions"),
  paymentMethod: z
    .enum(["card", "cash"])
    .describe("Payment method: card or cash"),
  promoCode: z.string().optional().describe("Promo code to apply"),
});

const cancelOrderSchema = z.object({
  orderId: z.string().describe("The ID of the order to cancel"),
});

// Location schemas
const setLocationSchema = z.object({
  locationId: z.string().describe("The ID of the location to set as preferred"),
});

const getLocationsSchema = z.object({
  nearCoordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional()
    .describe("Coordinates to find nearest locations"),
});

// Factory function to create tools with user context
export function createKitchenTools(context: ToolContext) {
  return {
    // ===== MENU TOOLS =====
    getMenu: tool({
      description:
        "Get the menu items, optionally filtered by category or dietary preferences. Returns up to 10 items by default.",
      inputSchema: getMenuSchema,
      execute: async (params) => {
        const { category, dietary, search, limit = 10 } = params;

        const items = await getMenuItems({
          category: category === "all" ? undefined : category,
          dietaryTypes:
            dietary && dietary !== "none" ? [dietary as never] : undefined,
          search,
          availableOnly: true,
        });

        const limitedItems = items.slice(0, limit);
        const hasMore = items.length > limit;

        return {
          items: limitedItems.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description:
              item.shortDescription || item.description?.slice(0, 100),
            price: `$${Number(item.price).toFixed(2)}`,
            category: item.category,
            dietary: item.dietaryTypes,
            featured: item.featured,
          })),
          totalItems: items.length,
          showing: limitedItems.length,
          hasMore,
          message: hasMore
            ? `Showing ${limitedItems.length} of ${items.length} items. Ask for more or filter by category for additional items.`
            : undefined,
        };
      },
    }),

    getMenuItemDetails: tool({
      description:
        "Get detailed information about a specific menu item including ingredients and allergens",
      inputSchema: getMenuItemDetailsSchema,
      execute: async (params) => {
        const { itemSlug } = params;
        const item = await getMenuItemBySlug(itemSlug);

        if (!item) {
          return {
            found: false,
            message: `Could not find menu item with slug "${itemSlug}"`,
          };
        }

        return {
          found: true,
          item: {
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: `$${Number(item.price).toFixed(2)}`,
            category: item.category,
            dietary: item.dietaryTypes,
            allergens: item.allergens,
            nutritionalInfo: item.nutritionalInfo,
            image: item.image,
            featured: item.featured,
            customizationOptions: item.customizationOptions.map((opt) => ({
              name: opt.name,
              type: opt.type,
              required: opt.required,
              options: opt.options ? JSON.parse(opt.options) : null,
              priceModifier: opt.priceModifier,
            })),
          },
        };
      },
    }),

    checkAllergens: tool({
      description: "Check if a menu item contains specific allergens",
      inputSchema: checkAllergensSchema,
      execute: async (params) => {
        const { itemSlug, allergen } = params;
        const item = await getMenuItemBySlug(itemSlug);

        if (!item) {
          return {
            found: false,
            message: `Could not find menu item with slug "${itemSlug}"`,
          };
        }

        const allergensText = item.allergens?.toLowerCase() || "";
        const containsAllergen = allergensText.includes(allergen.toLowerCase());

        return {
          found: true,
          itemName: item.name,
          allergen,
          containsAllergen,
          allAllergens: item.allergens,
          message: containsAllergen
            ? `Yes, ${item.name} contains ${allergen}.`
            : `No, ${item.name} does not contain ${allergen}.`,
        };
      },
    }),

    getRecommendations: tool({
      description:
        "Get personalized menu recommendations based on preferences or popular items",
      inputSchema: getRecommendationsSchema,
      execute: async (params) => {
        const { preference, limit = 4 } = params;

        let items = await getMenuItems({ availableOnly: true });

        switch (preference) {
          case "popular":
            items = items.filter((item) => item.featured);
            break;
          case "vegetarian":
            items = items.filter(
              (item) =>
                item.dietaryTypes.includes("vegetarian") ||
                item.dietaryTypes.includes("vegan"),
            );
            break;
          case "healthy":
            items = items.filter(
              (item) =>
                item.dietaryTypes.includes("gluten-free") ||
                item.category === "sides",
            );
            break;
          case "quick":
            items = items.filter(
              (item) => item.category === "sides" || item.category === "drinks",
            );
            break;
          default:
            items = items.filter((item) => item.featured);
        }

        return {
          recommendations: items.slice(0, limit).map((item) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            description: item.shortDescription || item.description,
            price: `$${Number(item.price).toFixed(2)}`,
            reason: item.featured ? "Customer favorite" : "Chef's pick",
          })),
          message: `Here are my top recommendations for ${preference || "you"}:`,
        };
      },
    }),

    // ===== LOCATION TOOLS =====
    getLocations: tool({
      description: "Get all available Caspers Kitchen locations",
      inputSchema: getLocationsSchema,
      execute: async () => {
        const locations = await getAllLocations();

        return {
          locations: locations.map((loc) => ({
            id: loc.id,
            name: loc.name,
            slug: loc.slug,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            neighborhood: loc.neighborhood,
            phone: loc.phone,
            isOpen: isLocationOpen(loc),
            deliveryFee: `$${loc.deliveryFee}`,
          })),
          totalLocations: locations.length,
        };
      },
    }),

    getUserLocation: tool({
      description: "Get the user's currently selected Caspers Kitchen location",
      inputSchema: z.object({}),
      execute: async () => {
        if (!context.userId) {
          return {
            found: false,
            message:
              "No location set. Please select a location to see menu availability and delivery options.",
          };
        }

        const location = await getUserLocation(context.userId);

        if (!location) {
          return {
            found: false,
            message:
              "No location set. Please select a location to see menu availability and delivery options.",
          };
        }

        return {
          found: true,
          location: {
            id: location.id,
            name: location.name,
            slug: location.slug,
            address: location.address,
            city: location.city,
            state: location.state,
            phone: location.phone,
            isOpen: isLocationOpen(location),
            deliveryFee: `$${location.deliveryFee}`,
          },
        };
      },
    }),

    setUserLocation: tool({
      description: "Set the user's preferred Caspers Kitchen location",
      inputSchema: setLocationSchema,
      execute: async (params) => {
        if (!context.userId) {
          return {
            success: false,
            message: "You must be signed in to set a preferred location.",
          };
        }

        const { locationId } = params;
        const location = await setUserLocation(context.userId, locationId);

        if (!location) {
          return {
            success: false,
            message: "Could not find location with that ID.",
          };
        }

        return {
          success: true,
          location: {
            id: location.id,
            name: location.name,
            address: location.address,
            city: location.city,
          },
          message: `Your preferred location is now set to ${location.name}.`,
        };
      },
    }),

    getBusinessHours: tool({
      description: "Get the business hours for a Caspers Kitchen location",
      inputSchema: getBusinessHoursSchema,
      execute: async (params) => {
        const { locationId, day = "today" } = params;

        let location;
        if (locationId) {
          location = await getLocationById(locationId);
        } else if (context.userId) {
          location = await getUserLocation(context.userId);
        }

        if (!location) {
          // Return default hours if no location
          const locations = await getAllLocations();
          if (locations.length === 0) {
            return {
              message: "No locations available.",
            };
          }
          location = locations[0];
        }

        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as const;
        const now = new Date();
        const currentDay = days[now.getDay()];
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const dayToCheck = day === "today" ? currentDay : day;
        const hours = location.operatingHours[dayToCheck];

        if (!hours || hours.closed) {
          return {
            location: location.name,
            day: dayToCheck,
            closed: true,
            message: `${location.name} is closed on ${dayToCheck}.`,
          };
        }

        const isOpen =
          dayToCheck === currentDay &&
          currentTime >= hours.open &&
          currentTime < hours.close;

        return {
          location: location.name,
          day: dayToCheck,
          hours: {
            open: hours.open,
            close: hours.close,
          },
          isOpen,
          currentTime: dayToCheck === currentDay ? currentTime : undefined,
          message: isOpen
            ? `${location.name} is currently open! Hours: ${hours.open} - ${hours.close}`
            : `${location.name} hours for ${dayToCheck}: ${hours.open} - ${hours.close}`,
        };
      },
    }),

    getEstimatedDeliveryTime: tool({
      description: "Get estimated delivery time for a new order",
      inputSchema: getEstimatedDeliveryTimeSchema,
      execute: async (params) => {
        const { locationId } = params;
        const location = await getLocationById(locationId);

        if (!location) {
          return {
            available: false,
            message: "Location not found.",
          };
        }

        // Estimate based on current time and typical preparation
        const baseTime = 30;
        const variance = Math.floor(Math.random() * 15);
        const estimatedMinutes = baseTime + variance;

        return {
          available: true,
          locationName: location.name,
          estimatedMinutes,
          range: `${estimatedMinutes - 5}-${estimatedMinutes + 10} minutes`,
          deliveryFee: `$${location.deliveryFee}`,
          message: `Delivery from ${location.name} is estimated at ${estimatedMinutes - 5}-${estimatedMinutes + 10} minutes.`,
        };
      },
    }),

    // ===== CART TOOLS =====
    getCart: tool({
      description: "Get the current contents of the user's shopping cart",
      inputSchema: z.object({}),
      execute: async () => {
        const cart = await getCart(context.userId, context.sessionId);

        if (!cart || cart.items.length === 0) {
          return {
            empty: true,
            items: [],
            message: "Your cart is empty. Would you like some recommendations?",
          };
        }

        const subtotal = cart.items.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );

        return {
          empty: false,
          cartId: cart.id,
          items: cart.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            quantity: item.quantity,
            unitPrice: `$${Number(item.unitPrice).toFixed(2)}`,
            totalPrice: `$${(Number(item.unitPrice) * item.quantity).toFixed(2)}`,
            customizations: item.customizations,
          })),
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: `$${subtotal.toFixed(2)}`,
          message: `You have ${cart.items.length} item(s) in your cart totaling $${subtotal.toFixed(2)}.`,
        };
      },
    }),

    addToCart: tool({
      description: "Add a menu item to the user's shopping cart",
      inputSchema: addToCartSchema,
      execute: async (params) => {
        const { menuItemId, quantity, customizations } = params;

        // Get menu item to verify it exists and get price
        const [menuItem] = await getMenuItemsByIds([menuItemId]);

        if (!menuItem) {
          return {
            success: false,
            message:
              "Menu item not found. Please check the item and try again.",
          };
        }

        if (!menuItem.isAvailable) {
          return {
            success: false,
            message: `Sorry, ${menuItem.name} is currently unavailable.`,
          };
        }

        const cartItem = await addItemToCart({
          userId: context.userId,
          sessionId: context.sessionId,
          menuItemId,
          quantity,
          unitPrice: menuItem.price,
          customizations,
        });

        // Track event (fire and forget)
        trackCartItemAdded({
          userId: context.userId,
          sessionId: context.sessionId,
          source: "ai",
          menuItemId,
          menuItemName: menuItem.name,
          quantity,
          unitPrice: menuItem.price,
        }).catch((err) =>
          console.error("Failed to track cart_item_added:", err),
        );

        return {
          success: true,
          cartItem: {
            id: cartItem.id,
            name: cartItem.menuItem.name,
            quantity: cartItem.quantity,
            unitPrice: `$${Number(cartItem.unitPrice).toFixed(2)}`,
          },
          message: `Added ${quantity}x ${menuItem.name} to your cart.`,
        };
      },
    }),

    updateCartItem: tool({
      description: "Update the quantity of an item in the cart",
      inputSchema: updateCartItemSchema,
      execute: async (params) => {
        const { cartItemId, quantity } = params;

        // Get current cart to find previous quantity
        const cart = await getCart(context.userId, context.sessionId);
        const currentItem = cart?.items.find((item) => item.id === cartItemId);
        const previousQuantity = currentItem?.quantity ?? 0;

        const updatedItem = await updateCartItemQuantity(cartItemId, quantity);

        // Track event (fire and forget)
        trackCartItemUpdated({
          userId: context.userId,
          sessionId: context.sessionId,
          source: "ai",
          cartItemId,
          menuItemName: updatedItem.menuItem.name,
          previousQuantity,
          newQuantity: quantity,
        }).catch((err) =>
          console.error("Failed to track cart_item_updated:", err),
        );

        return {
          success: true,
          cartItem: {
            id: updatedItem.id,
            name: updatedItem.menuItem.name,
            quantity: updatedItem.quantity,
          },
          message: `Updated ${updatedItem.menuItem.name} quantity to ${quantity}.`,
        };
      },
    }),

    removeFromCart: tool({
      description: "Remove an item from the cart",
      inputSchema: removeFromCartSchema,
      execute: async (params) => {
        const { cartItemId } = params;

        // Get item details before deletion for tracking
        const cart = await getCart(context.userId, context.sessionId);
        const itemToRemove = cart?.items.find((item) => item.id === cartItemId);

        await removeCartItem(cartItemId);

        // Track event (fire and forget)
        trackCartItemRemoved({
          userId: context.userId,
          sessionId: context.sessionId,
          source: "ai",
          cartItemId,
          menuItemName: itemToRemove?.menuItem.name,
        }).catch((err) =>
          console.error("Failed to track cart_item_removed:", err),
        );

        return {
          success: true,
          message: "Item removed from cart.",
        };
      },
    }),

    clearCart: tool({
      description: "Remove all items from the cart",
      inputSchema: z.object({}),
      execute: async () => {
        const cart = await getCart(context.userId, context.sessionId);

        if (!cart) {
          return {
            success: true,
            message: "Cart is already empty.",
          };
        }

        await clearCart(cart.id);

        return {
          success: true,
          message: "Cart cleared successfully.",
        };
      },
    }),

    // ===== ORDER TOOLS =====
    getOrderStatus: tool({
      description: "Get the status of an order by order ID or order number",
      inputSchema: getOrderStatusSchema,
      execute: async (params) => {
        const { orderId, orderNumber } = params;

        let order;

        if (orderId) {
          order = await getOrder(orderId);
        } else if (orderNumber) {
          order = await getOrderByNumber(orderNumber);
        } else if (context.userId) {
          // Get latest order for user
          const orders = await getUserOrders(context.userId);
          order = orders[0];
        }

        if (!order) {
          return {
            found: false,
            message:
              "Could not find order. Please check the order ID or number.",
          };
        }

        const statusMessages: Record<string, string> = {
          pending: "Your order has been received and is being processed.",
          confirmed: "Your order has been confirmed and will be prepared soon.",
          preparing: "Your order is being prepared in the kitchen.",
          ready: "Your order is ready for pickup/delivery.",
          out_for_delivery: "Your order is on its way!",
          delivered: "Your order has been delivered.",
          cancelled: "This order has been cancelled.",
        };

        return {
          found: true,
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: `$${Number(order.total).toFixed(2)}`,
            itemCount: order.items.length,
            items: order.items.map((item) => ({
              name: item.itemName,
              quantity: item.quantity,
              price: `$${Number(item.totalPrice).toFixed(2)}`,
            })),
            estimatedDelivery:
              order.estimatedDeliveryTime?.toLocaleTimeString(),
            createdAt: order.createdAt.toLocaleString(),
          },
          message:
            statusMessages[order.status] || `Order status: ${order.status}`,
        };
      },
    }),

    getUserOrders: tool({
      description: "Get the user's order history",
      inputSchema: getUserOrdersSchema,
      execute: async (params) => {
        if (!context.userId) {
          return {
            success: false,
            orders: [],
            message: "You must be signed in to view your order history.",
          };
        }

        const { limit = 10 } = params;
        const orders = await getUserOrders(context.userId);
        const limitedOrders = orders.slice(0, limit);

        if (limitedOrders.length === 0) {
          return {
            success: true,
            orders: [],
            message: "You haven't placed any orders yet.",
          };
        }

        return {
          success: true,
          orders: limitedOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: `$${Number(order.total).toFixed(2)}`,
            itemCount: order.items.length,
            createdAt: order.createdAt.toLocaleString(),
          })),
          totalOrders: orders.length,
          message: `Found ${orders.length} order(s) in your history.`,
        };
      },
    }),

    placeOrder: tool({
      description: "Place an order with items currently in the cart",
      inputSchema: placeOrderSchema,
      execute: async (params) => {
        const cart = await getCart(context.userId, context.sessionId);

        if (!cart || cart.items.length === 0) {
          return {
            success: false,
            message:
              "Your cart is empty. Add some items before placing an order.",
          };
        }

        // Get user's location
        let locationId: string | null = null;
        if (context.userId) {
          const userLoc = await getUserLocation(context.userId);
          locationId = userLoc?.id ?? null;
        }

        if (!locationId) {
          const locations = await getAllLocations();
          locationId = locations[0]?.id ?? null;
        }

        if (!locationId) {
          return {
            success: false,
            message: "Please select a location before placing an order.",
          };
        }

        const {
          deliveryAddress,
          deliveryCity,
          deliveryState,
          deliveryZip,
          deliveryInstructions,
          paymentMethod,
          promoCode,
        } = params;

        const result = await createOrder({
          userId: context.userId,
          locationId,
          cartId: cart.id,
          deliveryAddress,
          deliveryCity,
          deliveryState,
          deliveryZip,
          deliveryInstructions,
          paymentMethod,
          promoCode,
        });

        // Get order details for tracking
        const order = await getOrder(result.orderId);

        // Track event (fire and forget)
        trackOrderCreated({
          userId: context.userId,
          sessionId: context.sessionId,
          source: "ai",
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          total: order?.total ?? "0",
          itemCount: order?.items.length ?? 0,
          locationId,
          paymentMethod,
        }).catch((err) => console.error("Failed to track order_created:", err));

        return {
          success: true,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          message: `Order ${result.orderNumber} placed successfully! You can track your order status anytime.`,
        };
      },
    }),

    cancelOrder: tool({
      description: "Cancel an order (only if it hasn't started preparation)",
      inputSchema: cancelOrderSchema,
      execute: async (params) => {
        const { orderId } = params;

        try {
          await cancelOrder(orderId);
          return {
            success: true,
            message:
              "Order cancelled successfully. Any payment will be refunded.",
          };
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Could not cancel order. It may already be in preparation.",
          };
        }
      },
    }),
  };
}

// Re-export tool types from separate file (to avoid circular deps)
export { TOOL_TYPES, type ToolType } from "./tool-types";

// Default export for API route (creates tools with empty context - context injected at runtime)
export const kitchenTools = createKitchenTools({});

// Export all tools (alias for backwards compatibility)
export const allTools = kitchenTools;
