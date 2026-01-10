import { db } from "@/lib/db/client";
import { menuItems, menuItemDietaryTypes } from "@/lib/menu/schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("Seeding menu items...");

  const items = [
    {
      id: nanoid(),
      name: "Classic Mac & Cheese",
      slug: "classic-mac-cheese",
      description:
        "Creamy three-cheese blend with elbow macaroni, topped with golden breadcrumbs. Made fresh daily with real aged cheddar, gruyere, and parmesan.",
      shortDescription: "Creamy three-cheese blend with golden breadcrumbs",
      price: "12.99",
      category: "mains" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: ["vegetarian"],
    },
    {
      id: nanoid(),
      name: "Homestyle Meatloaf",
      slug: "homestyle-meatloaf",
      description:
        "Tender beef and pork blend with secret family spices, topped with tangy tomato glaze. Served with mashed potatoes and seasonal vegetables.",
      shortDescription: "Tender beef and pork with tangy tomato glaze",
      price: "16.99",
      category: "mains" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: [],
    },
    {
      id: nanoid(),
      name: "Crispy Chicken Tenders",
      slug: "crispy-chicken-tenders",
      description:
        "Hand-breaded chicken breast strips fried to golden perfection. Served with honey mustard and BBQ dipping sauces.",
      shortDescription: "Hand-breaded chicken strips with dipping sauces",
      price: "13.99",
      category: "mains" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: [],
    },
    {
      id: nanoid(),
      name: "Veggie Buddha Bowl",
      slug: "veggie-buddha-bowl",
      description:
        "Quinoa and roasted vegetables with tahini dressing. Features sweet potato, chickpeas, kale, and avocado. A nutritious plant-based meal.",
      shortDescription: "Quinoa and roasted veggies with tahini",
      price: "14.99",
      category: "mains" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: ["vegetarian", "vegan"],
    },
    {
      id: nanoid(),
      name: "Loaded Cheese Fries",
      slug: "loaded-cheese-fries",
      description:
        "Crispy golden fries topped with melted cheddar, bacon bits, sour cream, and chives. Perfect for sharing or keeping all to yourself!",
      shortDescription: "Crispy fries with cheese, bacon, and sour cream",
      price: "8.99",
      category: "sides" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: [],
    },
    {
      id: nanoid(),
      name: "Garden Fresh Salad",
      slug: "garden-fresh-salad",
      description:
        "Mixed greens with cherry tomatoes, cucumber, carrots, and house vinaigrette. Light and refreshing side to any meal.",
      shortDescription: "Mixed greens with fresh vegetables",
      price: "6.99",
      category: "sides" as const,
      isAvailable: true,
      featured: true,
      dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
    },
    {
      id: nanoid(),
      name: "Garlic Parmesan Wings",
      slug: "garlic-parmesan-wings",
      description:
        "Crispy chicken wings tossed in garlic butter and parmesan. Served with ranch or blue cheese dressing.",
      shortDescription: "Wings with garlic butter and parmesan",
      price: "11.99",
      category: "sides" as const,
      isAvailable: true,
      dietaryTypes: [],
    },
    {
      id: nanoid(),
      name: "Sweet Potato Fries",
      slug: "sweet-potato-fries",
      description:
        "Crispy sweet potato fries with a hint of cinnamon sugar. Served with chipotle mayo dipping sauce.",
      shortDescription: "Crispy sweet fries with chipotle mayo",
      price: "7.99",
      category: "sides" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian", "vegan"],
    },
    {
      id: nanoid(),
      name: "Chocolate Lava Cake",
      slug: "chocolate-lava-cake",
      description:
        "Warm chocolate cake with molten center, served with vanilla ice cream. The ultimate chocolate lover's dessert.",
      shortDescription: "Warm chocolate cake with molten center",
      price: "7.99",
      category: "desserts" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian"],
    },
    {
      id: nanoid(),
      name: "New York Cheesecake",
      slug: "new-york-cheesecake",
      description:
        "Classic creamy cheesecake with graham cracker crust. Choice of strawberry or chocolate sauce.",
      shortDescription: "Creamy cheesecake with choice of topping",
      price: "6.99",
      category: "desserts" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian"],
    },
    {
      id: nanoid(),
      name: "Apple Pie à la Mode",
      slug: "apple-pie-a-la-mode",
      description:
        "Homemade apple pie with cinnamon and brown sugar, served warm with vanilla ice cream.",
      shortDescription: "Warm apple pie with vanilla ice cream",
      price: "6.99",
      category: "desserts" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian"],
    },
    {
      id: nanoid(),
      name: "Craft Soda Selection",
      slug: "craft-soda-selection",
      description:
        "Choose from our rotating selection of locally-made craft sodas. Flavors change seasonally.",
      shortDescription: "Locally-made craft sodas",
      price: "3.99",
      category: "drinks" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
    },
    {
      id: nanoid(),
      name: "Fresh Lemonade",
      slug: "fresh-lemonade",
      description:
        "House-made lemonade with real lemons and just the right amount of sweetness. Refreshing and perfect for any meal.",
      shortDescription: "House-made lemonade",
      price: "3.49",
      category: "drinks" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
    },
    {
      id: nanoid(),
      name: "Iced Coffee",
      slug: "iced-coffee",
      description:
        "Cold-brewed coffee served over ice. Add vanilla, caramel, or hazelnut syrup for extra flavor.",
      shortDescription: "Cold-brewed coffee over ice",
      price: "4.49",
      category: "drinks" as const,
      isAvailable: true,
      dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
    },
  ];

  for (const item of items) {
    const { dietaryTypes, ...itemData } = item;

    await db.insert(menuItems).values(itemData);

    if (dietaryTypes.length > 0) {
      await db.insert(menuItemDietaryTypes).values(
        dietaryTypes.map((type) => ({
          id: nanoid(),
          menuItemId: item.id,
          dietaryType: type as "vegetarian" | "vegan" | "gluten-free",
        })),
      );
    }

    console.log(`✓ Created: ${item.name}`);
  }

  console.log(`\nSuccessfully seeded ${items.length} menu items!`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding menu items:", error);
  process.exit(1);
});
