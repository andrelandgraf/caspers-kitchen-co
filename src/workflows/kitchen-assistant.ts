import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { z } from "zod";
import type { ModelMessage, UIMessageChunk } from "ai";

// Menu data (simplified for workflow)
const menuItems = [
  { name: "Classic Burger", price: 12.99, category: "mains", dietary: [] },
  {
    name: "Veggie Burger",
    price: 13.99,
    category: "mains",
    dietary: ["vegetarian"],
  },
  { name: "Loaded Fries", price: 8.99, category: "sides", dietary: [] },
  {
    name: "Garden Salad",
    price: 9.99,
    category: "sides",
    dietary: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    name: "Mac & Cheese",
    price: 10.99,
    category: "sides",
    dietary: ["vegetarian"],
  },
  {
    name: "Grilled Chicken Bowl",
    price: 14.99,
    category: "mains",
    dietary: ["gluten-free"],
  },
  { name: "Fish Tacos", price: 15.99, category: "mains", dietary: [] },
  {
    name: "Chocolate Lava Cake",
    price: 7.99,
    category: "desserts",
    dietary: ["vegetarian"],
  },
];

const businessHours = {
  monday: { open: "11:00", close: "21:00" },
  tuesday: { open: "11:00", close: "21:00" },
  wednesday: { open: "11:00", close: "21:00" },
  thursday: { open: "11:00", close: "22:00" },
  friday: { open: "11:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "20:00" },
};

// Step functions - these are durable and retryable
async function getMenu({
  category,
  dietary,
}: {
  category?: string;
  dietary?: string;
}) {
  "use step";

  let items = [...menuItems];

  if (category && category !== "all") {
    items = items.filter((item) => item.category === category);
  }

  if (dietary && dietary !== "none") {
    items = items.filter((item) => item.dietary.includes(dietary));
  }

  return {
    items: items.map((item) => ({
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      category: item.category,
      dietary: item.dietary,
    })),
    totalItems: items.length,
  };
}

async function getBusinessHours({ day }: { day?: string }) {
  "use step";

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
    !day || day === "today" ? currentDay : (day as keyof typeof businessHours);

  if (!day || day === "today" || day === currentDay) {
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
    return { message: `Invalid day: ${day}` };
  }

  return {
    day: dayToCheck,
    hours,
    message: `${dayToCheck.charAt(0).toUpperCase() + dayToCheck.slice(1)} hours: ${hours.open} - ${hours.close}`,
  };
}

async function getRecommendations({ preference }: { preference?: string }) {
  "use step";

  let items = [...menuItems];
  const pref = preference || "popular";

  switch (pref) {
    case "popular":
      items = items.slice(0, 4);
      break;
    case "vegetarian":
      items = items.filter((item) => item.dietary.includes("vegetarian"));
      break;
    case "healthy":
      items = items.filter(
        (item) =>
          item.dietary.includes("gluten-free") || item.category === "sides",
      );
      break;
    default:
      items = items.slice(0, 3);
  }

  return {
    recommendations: items.map((item) => ({
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
    })),
    message: `Here are my top recommendations for ${pref}:`,
  };
}

const KITCHEN_ASSISTANT_PROMPT = `You are Casper, a friendly and helpful AI assistant for Caspers Kitchen, a modern ghost kitchen.

Your capabilities:
- Help customers browse the menu and find items that match their preferences
- Answer questions about dietary options
- Provide personalized food recommendations
- Share business hours and availability information

Guidelines:
- Be warm, conversational, and helpful
- Use the available tools to provide accurate, real-time information
- When suggesting menu items, mention prices
- Keep responses concise but informative`;

// The main workflow function - durable and resumable
export async function kitchenAssistantWorkflow(messages: ModelMessage[]) {
  "use workflow";

  const writable = getWritable<UIMessageChunk>();

  const agent = new DurableAgent({
    model: "anthropic/claude-sonnet-4-20250514",
    system: KITCHEN_ASSISTANT_PROMPT,
    temperature: 0.7,
    tools: {
      getMenu: {
        description:
          "Get the menu items, optionally filtered by category or dietary preferences",
        inputSchema: z.object({
          category: z
            .string()
            .optional()
            .describe("Category to filter by: mains, sides, desserts, or all"),
          dietary: z
            .string()
            .optional()
            .describe(
              "Dietary preference: vegetarian, vegan, gluten-free, or none",
            ),
        }),
        execute: getMenu,
      },
      getBusinessHours: {
        description: "Get the business hours for Caspers Kitchen",
        inputSchema: z.object({
          day: z
            .string()
            .optional()
            .describe("Specific day to check: monday-sunday, or today"),
        }),
        execute: getBusinessHours,
      },
      getRecommendations: {
        description:
          "Get personalized menu recommendations based on preferences",
        inputSchema: z.object({
          preference: z
            .string()
            .optional()
            .describe(
              "Type of recommendation: popular, vegetarian, or healthy",
            ),
        }),
        execute: getRecommendations,
      },
    },
  });

  const result = await agent.stream({
    messages,
    writable,
    maxSteps: 5,
  });

  return {
    messages: result.messages,
    steps: result.steps.length,
  };
}
