import { tool } from "ai";
import { z } from "zod";

// Menu data (in a real app, this would come from a database)
const menuItems = [
  {
    id: "1",
    name: "Classic Burger",
    description:
      "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
    price: 12.99,
    category: "mains",
    dietary: ["contains-gluten"],
    allergens: ["gluten", "dairy"],
    ingredients: [
      "beef patty",
      "lettuce",
      "tomato",
      "onion",
      "pickles",
      "special sauce",
      "brioche bun",
    ],
    spicy: false,
    popular: true,
  },
  {
    id: "2",
    name: "Veggie Delight Burger",
    description: "Plant-based patty with avocado, sprouts, and chipotle mayo",
    price: 13.99,
    category: "mains",
    dietary: ["vegetarian", "vegan-option"],
    allergens: ["gluten", "soy"],
    ingredients: [
      "plant-based patty",
      "avocado",
      "sprouts",
      "chipotle mayo",
      "lettuce",
      "whole wheat bun",
    ],
    spicy: true,
    popular: true,
  },
  {
    id: "3",
    name: "Loaded Fries",
    description:
      "Crispy fries topped with cheese, bacon bits, and green onions",
    price: 8.99,
    category: "sides",
    dietary: [],
    allergens: ["dairy"],
    ingredients: ["potatoes", "cheese", "bacon", "green onions", "sour cream"],
    spicy: false,
    popular: true,
  },
  {
    id: "4",
    name: "Garden Salad",
    description:
      "Fresh mixed greens with cherry tomatoes, cucumber, and balsamic dressing",
    price: 9.99,
    category: "sides",
    dietary: ["vegetarian", "vegan", "gluten-free"],
    allergens: [],
    ingredients: [
      "mixed greens",
      "cherry tomatoes",
      "cucumber",
      "red onion",
      "balsamic dressing",
    ],
    spicy: false,
    popular: false,
  },
  {
    id: "5",
    name: "Mac & Cheese",
    description: "Creamy three-cheese pasta with breadcrumb topping",
    price: 10.99,
    category: "sides",
    dietary: ["vegetarian"],
    allergens: ["gluten", "dairy"],
    ingredients: [
      "macaroni",
      "cheddar",
      "gruyere",
      "parmesan",
      "breadcrumbs",
      "butter",
    ],
    spicy: false,
    popular: true,
  },
  {
    id: "6",
    name: "Spicy Thai Soup",
    description:
      "Coconut milk based soup with lemongrass, ginger, and vegetables",
    price: 11.99,
    category: "soups",
    dietary: ["vegetarian", "vegan", "gluten-free"],
    allergens: [],
    ingredients: [
      "coconut milk",
      "lemongrass",
      "ginger",
      "mushrooms",
      "tofu",
      "bok choy",
      "thai basil",
    ],
    spicy: true,
    popular: false,
  },
  {
    id: "7",
    name: "Tomato Basil Soup",
    description: "Classic creamy tomato soup with fresh basil",
    price: 8.99,
    category: "soups",
    dietary: ["vegetarian", "gluten-free"],
    allergens: ["dairy"],
    ingredients: ["tomatoes", "cream", "basil", "garlic", "onion"],
    spicy: false,
    popular: true,
  },
  {
    id: "8",
    name: "Grilled Chicken Bowl",
    description: "Tender grilled chicken over rice with roasted vegetables",
    price: 14.99,
    category: "mains",
    dietary: ["gluten-free"],
    allergens: [],
    ingredients: [
      "chicken breast",
      "jasmine rice",
      "zucchini",
      "bell peppers",
      "onion",
      "herb sauce",
    ],
    spicy: false,
    popular: true,
  },
  {
    id: "9",
    name: "Fish Tacos",
    description: "Crispy beer-battered fish with slaw and lime crema",
    price: 15.99,
    category: "mains",
    dietary: [],
    allergens: ["gluten", "fish", "dairy"],
    ingredients: [
      "cod",
      "cabbage slaw",
      "lime crema",
      "corn tortillas",
      "cilantro",
    ],
    spicy: false,
    popular: true,
  },
  {
    id: "10",
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "desserts",
    dietary: ["vegetarian"],
    allergens: ["gluten", "dairy", "eggs"],
    ingredients: [
      "dark chocolate",
      "butter",
      "eggs",
      "flour",
      "sugar",
      "vanilla ice cream",
    ],
    spicy: false,
    popular: true,
  },
];

// Business hours
const businessHours = {
  monday: { open: "11:00", close: "21:00" },
  tuesday: { open: "11:00", close: "21:00" },
  wednesday: { open: "11:00", close: "21:00" },
  thursday: { open: "11:00", close: "22:00" },
  friday: { open: "11:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "20:00" },
};

// Simulated orders (in a real app, this would come from a database)
const sampleOrders = [
  {
    id: "ORD-12345",
    status: "preparing",
    items: [
      { name: "Classic Burger", quantity: 2, price: 12.99 },
      { name: "Loaded Fries", quantity: 1, price: 8.99 },
    ],
    total: 34.97,
    estimatedDelivery: "25-35 minutes",
    placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-12344",
    status: "delivered",
    items: [
      { name: "Fish Tacos", quantity: 1, price: 15.99 },
      { name: "Garden Salad", quantity: 1, price: 9.99 },
    ],
    total: 25.98,
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
    ).toISOString(),
  },
];

export const kitchenTools = {
  getMenu: tool({
    description:
      "Get the menu items, optionally filtered by category or dietary preferences",
    inputSchema: z.object({
      category: z
        .string()
        .describe(
          "Category to filter by: mains, sides, soups, desserts, or all",
        ),
      dietary: z
        .string()
        .describe(
          "Dietary preference: vegetarian, vegan, gluten-free, or none",
        ),
      limit: z.number().describe("Maximum number of items to return"),
    }),
    execute: async ({ category, dietary, limit }) => {
      let items = [...menuItems];

      if (category && category !== "all") {
        items = items.filter((item) => item.category === category);
      }

      if (dietary && dietary !== "none") {
        items = items.filter((item) => item.dietary.includes(dietary));
      }

      if (limit && limit > 0) {
        items = items.slice(0, limit);
      }

      return {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: `$${item.price.toFixed(2)}`,
          category: item.category,
          dietary: item.dietary,
          popular: item.popular,
          spicy: item.spicy,
        })),
        totalItems: items.length,
      };
    },
  }),

  getMenuItemDetails: tool({
    description:
      "Get detailed information about a specific menu item including ingredients and allergens",
    inputSchema: z.object({
      itemName: z.string().describe("The name of the menu item to look up"),
    }),
    execute: async ({ itemName }) => {
      const item = menuItems.find((i) =>
        i.name.toLowerCase().includes(itemName.toLowerCase()),
      );

      if (!item) {
        return {
          found: false,
          message: `Could not find menu item matching "${itemName}"`,
        };
      }

      return {
        found: true,
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: `$${item.price.toFixed(2)}`,
          category: item.category,
          dietary: item.dietary,
          allergens: item.allergens,
          ingredients: item.ingredients,
          spicy: item.spicy,
          popular: item.popular,
        },
      };
    },
  }),

  checkAllergens: tool({
    description: "Check if a menu item contains specific allergens",
    inputSchema: z.object({
      itemName: z.string().describe("The menu item to check"),
      allergen: z
        .string()
        .describe(
          "The allergen to check for: gluten, dairy, nuts, eggs, soy, fish, or shellfish",
        ),
    }),
    execute: async ({ itemName, allergen }) => {
      const item = menuItems.find((i) =>
        i.name.toLowerCase().includes(itemName.toLowerCase()),
      );

      if (!item) {
        return {
          found: false,
          message: `Could not find menu item matching "${itemName}"`,
        };
      }

      const containsAllergen = item.allergens.includes(allergen);

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

  getBusinessHours: tool({
    description: "Get the business hours for Caspers Kitchen",
    inputSchema: z.object({
      day: z
        .string()
        .describe(
          "Specific day to check: monday, tuesday, wednesday, thursday, friday, saturday, sunday, or today",
        ),
    }),
    execute: async ({ day }) => {
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

      const dayToCheck =
        day === "today" ? currentDay : (day as keyof typeof businessHours);

      if (day === "today" || day === currentDay) {
        const hours = businessHours[currentDay];
        const isOpen = currentTime >= hours.open && currentTime < hours.close;

        return {
          day: currentDay,
          hours,
          currentTime,
          isOpen,
          message: isOpen
            ? `We're currently open! Today's hours: ${hours.open} - ${hours.close}`
            : `We're currently closed. Today's hours: ${hours.open} - ${hours.close}`,
        };
      }

      const hours = businessHours[dayToCheck];
      if (!hours) {
        return {
          message: `Invalid day: ${day}. Please specify a day of the week or 'today'.`,
        };
      }

      return {
        day: dayToCheck,
        hours,
        message: `${dayToCheck.charAt(0).toUpperCase() + dayToCheck.slice(1)} hours: ${hours.open} - ${hours.close}`,
      };
    },
  }),

  getOrderStatus: tool({
    description:
      "Get the status of an order by order ID or get the current/latest order",
    inputSchema: z.object({
      orderId: z
        .string()
        .describe(
          "The order ID to look up (e.g., ORD-12345) or 'latest' for most recent",
        ),
    }),
    execute: async ({ orderId }) => {
      if (orderId === "latest") {
        const latestOrder = sampleOrders[0];
        return {
          found: true,
          order: latestOrder,
          message: `Your latest order (${latestOrder.id}) is ${latestOrder.status}. ${
            latestOrder.status === "preparing"
              ? `Estimated delivery: ${latestOrder.estimatedDelivery}`
              : ""
          }`,
        };
      }

      const order = sampleOrders.find(
        (o) => o.id.toLowerCase() === orderId.toLowerCase(),
      );

      if (!order) {
        return {
          found: false,
          message: `Could not find order with ID "${orderId}". Please check the order ID and try again.`,
        };
      }

      return {
        found: true,
        order,
        message: `Order ${order.id} is ${order.status}. ${
          order.status === "preparing"
            ? `Estimated delivery: ${order.estimatedDelivery}`
            : ""
        }`,
      };
    },
  }),

  getEstimatedDeliveryTime: tool({
    description: "Get estimated delivery time for a new order",
    inputSchema: z.object({
      address: z.string().describe("Delivery address to check"),
    }),
    execute: async ({ address }) => {
      // Simulated delivery time calculation
      const baseTime = 30;
      const variance = Math.floor(Math.random() * 15);
      const estimatedMinutes = baseTime + variance;

      return {
        estimatedMinutes,
        range: `${estimatedMinutes - 5}-${estimatedMinutes + 10} minutes`,
        message: `Delivery to ${address} is estimated at ${estimatedMinutes - 5}-${estimatedMinutes + 10} minutes.`,
        deliveryAvailable: true,
      };
    },
  }),

  getRecommendations: tool({
    description:
      "Get personalized menu recommendations based on preferences or popular items",
    inputSchema: z.object({
      preference: z
        .string()
        .describe(
          "Type of recommendation: popular, vegetarian, healthy, comfort-food, or quick",
        ),
    }),
    execute: async ({ preference }) => {
      let items = [...menuItems];

      // Apply preference filter
      switch (preference) {
        case "popular":
          items = items.filter((item) => item.popular);
          break;
        case "vegetarian":
          items = items.filter(
            (item) =>
              item.dietary.includes("vegetarian") ||
              item.dietary.includes("vegan"),
          );
          break;
        case "healthy":
          items = items.filter(
            (item) =>
              item.dietary.includes("gluten-free") || item.category === "sides",
          );
          break;
        case "comfort-food":
          items = items.filter((item) =>
            [
              "Mac & Cheese",
              "Classic Burger",
              "Loaded Fries",
              "Tomato Basil Soup",
            ].includes(item.name),
          );
          break;
        case "quick":
          items = items.filter(
            (item) => item.category === "sides" || item.category === "soups",
          );
          break;
        default:
          items = items.filter((item) => item.popular).slice(0, 3);
      }

      return {
        recommendations: items.slice(0, 4).map((item) => ({
          name: item.name,
          description: item.description,
          price: `$${item.price.toFixed(2)}`,
          reason: item.popular ? "Customer favorite" : "Chef's pick",
        })),
        message: `Here are my top recommendations for ${preference}:`,
      };
    },
  }),
};
