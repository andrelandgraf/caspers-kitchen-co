import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

import { db } from "@/lib/db/client";
import {
  menuItems,
  menuItemDietaryTypes,
  customizationOptions,
} from "@/lib/menu/schema";
import { locations, menuItemLocations } from "@/lib/locations/schema";
import { v7 as uuidv7 } from "uuid";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI();

type Category = "mains" | "sides" | "desserts" | "drinks";
type DietaryType = "vegetarian" | "vegan" | "gluten-free";

type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  category: Category;
  isAvailable: boolean;
  featured: boolean;
  nutritionalInfo?: string;
  allergens?: string;
  dietaryTypes: DietaryType[];
  customizations?: Array<{
    name: string;
    type: "select" | "multi-select" | "text";
    required: boolean;
    options?: string[];
    priceModifier?: string;
  }>;
  // Which locations serve this item (empty = all locations)
  locationSlugs?: string[];
};

const foodItems: MenuItem[] = [
  // === MAINS ===
  {
    id: uuidv7(),
    name: "Smoky BBQ Pulled Pork Bowl",
    slug: "smoky-bbq-pulled-pork-bowl",
    description:
      "Slow-smoked pulled pork shoulder with our signature bourbon BBQ sauce, served over cilantro lime rice with pickled red onions, charred corn, and crispy fried shallots. A Southern-inspired comfort bowl that'll make you forget you're eating from a ghost kitchen.",
    shortDescription: "Slow-smoked pulled pork with bourbon BBQ sauce",
    price: "17.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 680, Protein: 38g, Carbs: 62g, Fat: 28g",
    allergens: "Soy, Wheat",
    dietaryTypes: [],
    customizations: [
      {
        name: "Spice Level",
        type: "select",
        required: false,
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
      },
      {
        name: "Extra Protein",
        type: "select",
        required: false,
        options: ["Extra Pork (+$4)", "Fried Egg (+$2)"],
        priceModifier: "4.00",
      },
    ],
  },
  {
    id: uuidv7(),
    name: "Tokyo Teriyaki Chicken",
    slug: "tokyo-teriyaki-chicken",
    description:
      "Flame-grilled chicken thighs glazed with house-made teriyaki, caramelized to perfection. Served with steamed jasmine rice, stir-fried vegetables, and a drizzle of sesame oil. Topped with toasted sesame seeds and green onions.",
    shortDescription: "Flame-grilled chicken with house-made teriyaki glaze",
    price: "16.49",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 620, Protein: 42g, Carbs: 58g, Fat: 22g",
    allergens: "Soy, Sesame, Wheat",
    dietaryTypes: [],
    locationSlugs: ["san-francisco", "los-angeles", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Mediterranean Lamb Kofta Plate",
    slug: "mediterranean-lamb-kofta-plate",
    description:
      "Hand-formed spiced lamb kofta kebabs served over fluffy basmati rice with cucumber tzatziki, Israeli salad, warm pita, and a generous drizzle of tahini. Finished with a sprinkle of sumac and fresh herbs.",
    shortDescription: "Spiced lamb kebabs with tzatziki and warm pita",
    price: "19.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 750, Protein: 36g, Carbs: 55g, Fat: 42g",
    allergens: "Wheat, Dairy, Sesame",
    dietaryTypes: [],
    locationSlugs: ["new-york", "san-francisco"],
  },
  {
    id: uuidv7(),
    name: "Mushroom Risotto Supreme",
    slug: "mushroom-risotto-supreme",
    description:
      "Creamy Arborio rice slowly cooked with a trio of wild mushrooms (shiitake, cremini, and oyster), finished with aged parmesan, truffle oil, and fresh thyme. A vegetarian masterpiece that doesn't compromise on richness.",
    shortDescription: "Creamy risotto with wild mushrooms and truffle oil",
    price: "18.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 580, Protein: 14g, Carbs: 68g, Fat: 28g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Spicy Korean Bibimbap",
    slug: "spicy-korean-bibimbap",
    description:
      "Traditional Korean rice bowl topped with seasoned vegetables, spicy gochujang, marinated beef bulgogi, and a perfectly fried egg. Served in a sizzling hot stone bowl for that perfect crispy rice bottom.",
    shortDescription: "Traditional Korean rice bowl with bulgogi",
    price: "17.49",
    category: "mains",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 720, Protein: 35g, Carbs: 75g, Fat: 30g",
    allergens: "Soy, Sesame, Eggs, Wheat",
    dietaryTypes: [],
    locationSlugs: ["los-angeles", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Coconut Curry Tofu Bowl",
    slug: "coconut-curry-tofu-bowl",
    description:
      "Crispy pressed tofu in rich Thai-inspired coconut curry with lemongrass, galangal, and kaffir lime leaves. Served over jasmine rice with bok choy, bell peppers, and fresh Thai basil.",
    shortDescription: "Crispy tofu in Thai coconut curry",
    price: "15.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 520, Protein: 22g, Carbs: 54g, Fat: 26g",
    allergens: "Soy, Tree Nuts",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
    customizations: [
      {
        name: "Protein Swap",
        type: "select",
        required: false,
        options: ["Chicken (+$3)", "Shrimp (+$5)"],
        priceModifier: "3.00",
      },
    ],
  },
  {
    id: uuidv7(),
    name: "Nashville Hot Chicken Sandwich",
    slug: "nashville-hot-chicken-sandwich",
    description:
      "Buttermilk-brined chicken thigh, hand-breaded and fried to golden perfection, then brushed with our fiery Nashville hot oil. Served on a brioche bun with creamy coleslaw and tangy pickles.",
    shortDescription: "Crispy fried chicken with Nashville hot spice",
    price: "14.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 780, Protein: 38g, Carbs: 58g, Fat: 42g",
    allergens: "Wheat, Dairy, Eggs",
    dietaryTypes: [],
    customizations: [
      {
        name: "Heat Level",
        type: "select",
        required: true,
        options: ["Southern (Mild)", "Medium", "Hot", "Shut the Cluck Up"],
      },
    ],
  },
  {
    id: uuidv7(),
    name: "Grilled Salmon Poke Bowl",
    slug: "grilled-salmon-poke-bowl",
    description:
      "Fresh Atlantic salmon seared to medium-rare, sliced over sushi rice with avocado, edamame, cucumber, seaweed salad, and mango. Drizzled with spicy mayo and ponzu sauce.",
    shortDescription: "Seared salmon poke with avocado and mango",
    price: "21.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 640, Protein: 38g, Carbs: 58g, Fat: 28g",
    allergens: "Fish, Soy, Sesame, Eggs",
    dietaryTypes: ["gluten-free"],
    locationSlugs: ["san-francisco", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Butter Chicken",
    slug: "butter-chicken",
    description:
      "Tender chicken tikka in a velvety tomato-cream curry sauce with aromatic spices. Served with fragrant basmati rice and warm garlic naan. A beloved Indian classic done right.",
    shortDescription: "Creamy tomato curry with tender chicken tikka",
    price: "17.99",
    category: "mains",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 720, Protein: 40g, Carbs: 62g, Fat: 32g",
    allergens: "Dairy, Wheat",
    dietaryTypes: [],
    locationSlugs: ["new-york", "san-francisco", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Black Bean Burrito Supreme",
    slug: "black-bean-burrito-supreme",
    description:
      "Giant flour tortilla stuffed with seasoned black beans, cilantro lime rice, pico de gallo, guacamole, vegan queso, and crispy tortilla strips. Smothered in verde salsa and garnished with fresh cilantro.",
    shortDescription: "Loaded vegan burrito with all the fixings",
    price: "13.99",
    category: "mains",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 680, Protein: 18g, Carbs: 92g, Fat: 24g",
    allergens: "Wheat",
    dietaryTypes: ["vegetarian", "vegan"],
  },
  {
    id: uuidv7(),
    name: "Cast Iron Ribeye Steak",
    slug: "cast-iron-ribeye-steak",
    description:
      "12oz USDA Prime ribeye, seared in cast iron with garlic butter, fresh thyme, and rosemary. Served with truffle parmesan fries and sautéed asparagus. The ultimate steakhouse experience delivered.",
    shortDescription: "12oz Prime ribeye with truffle parmesan fries",
    price: "34.99",
    category: "mains",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 980, Protein: 62g, Carbs: 42g, Fat: 62g",
    allergens: "Dairy",
    dietaryTypes: ["gluten-free"],
    locationSlugs: ["new-york", "los-angeles"],
    customizations: [
      {
        name: "Temperature",
        type: "select",
        required: true,
        options: ["Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"],
      },
    ],
  },
  {
    id: uuidv7(),
    name: "Crispy Falafel Wrap",
    slug: "crispy-falafel-wrap",
    description:
      "Golden crispy falafel balls made fresh daily, wrapped in warm pita with hummus, pickled turnips, Israeli salad, and creamy tahini sauce. A street food classic with serious crunch.",
    shortDescription: "Fresh falafel with hummus and tahini",
    price: "12.99",
    category: "mains",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 580, Protein: 18g, Carbs: 72g, Fat: 24g",
    allergens: "Wheat, Sesame",
    dietaryTypes: ["vegetarian", "vegan"],
  },

  // === SIDES ===
  {
    id: uuidv7(),
    name: "Truffle Parmesan Fries",
    slug: "truffle-parmesan-fries",
    description:
      "Hand-cut fries tossed in white truffle oil, freshly grated parmesan, and Italian herbs. Served with our house-made aioli for dipping.",
    shortDescription: "Truffle-kissed fries with aged parmesan",
    price: "9.99",
    category: "sides",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 420, Protein: 8g, Carbs: 48g, Fat: 24g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Korean Corn Cheese",
    slug: "korean-corn-cheese",
    description:
      "Sweet corn kernels mixed with creamy mozzarella, a touch of mayo, and a sprinkle of sugar - baked until golden and bubbly. A Korean pub favorite that's dangerously addictive.",
    shortDescription: "Baked corn with melted mozzarella",
    price: "8.49",
    category: "sides",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 320, Protein: 12g, Carbs: 28g, Fat: 18g",
    allergens: "Dairy, Eggs",
    dietaryTypes: ["vegetarian", "gluten-free"],
    locationSlugs: ["los-angeles", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Crispy Brussels Sprouts",
    slug: "crispy-brussels-sprouts",
    description:
      "Halved Brussels sprouts flash-fried until crispy, tossed in honey balsamic glaze with crispy pancetta bits and toasted almonds. Even Brussels sprout haters love these.",
    shortDescription: "Flash-fried with honey balsamic glaze",
    price: "10.99",
    category: "sides",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 280, Protein: 10g, Carbs: 22g, Fat: 18g",
    allergens: "Tree Nuts",
    dietaryTypes: ["gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Elote Street Corn",
    slug: "elote-street-corn",
    description:
      "Grilled corn on the cob slathered with chipotle mayo, cotija cheese, lime juice, and a dusting of tajín. Mexican street food perfection.",
    shortDescription: "Mexican street corn with chipotle and cotija",
    price: "6.99",
    category: "sides",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 240, Protein: 6g, Carbs: 28g, Fat: 14g",
    allergens: "Dairy, Eggs",
    dietaryTypes: ["vegetarian", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Spicy Edamame",
    slug: "spicy-edamame",
    description:
      "Steamed edamame pods tossed in chili garlic oil, sea salt, and a squeeze of fresh lime. Simple, healthy, and perfectly addictive.",
    shortDescription: "Chili garlic edamame with sea salt",
    price: "5.99",
    category: "sides",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 180, Protein: 14g, Carbs: 12g, Fat: 8g",
    allergens: "Soy",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Mac & Cheese Bites",
    slug: "mac-cheese-bites",
    description:
      "Creamy mac and cheese balls breaded and fried golden, served with jalapeño ranch for dipping. Comfort food in bite-sized form.",
    shortDescription: "Fried mac and cheese with jalapeño ranch",
    price: "8.99",
    category: "sides",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 480, Protein: 14g, Carbs: 42g, Fat: 28g",
    allergens: "Dairy, Wheat, Eggs",
    dietaryTypes: ["vegetarian"],
  },
  {
    id: uuidv7(),
    name: "Garlic Naan Bread",
    slug: "garlic-naan-bread",
    description:
      "Pillowy soft naan bread brushed with garlic butter and sprinkled with cilantro. Baked fresh to order in our tandoor oven.",
    shortDescription: "Fresh-baked garlic butter naan",
    price: "4.99",
    category: "sides",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 220, Protein: 6g, Carbs: 38g, Fat: 6g",
    allergens: "Wheat, Dairy",
    dietaryTypes: ["vegetarian"],
  },
  {
    id: uuidv7(),
    name: "Crispy Onion Rings",
    slug: "crispy-onion-rings",
    description:
      "Thick-cut sweet onion rings in a light, crispy beer batter served with our house-made chipotle ketchup.",
    shortDescription: "Beer-battered sweet onion rings",
    price: "7.99",
    category: "sides",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 360, Protein: 6g, Carbs: 44g, Fat: 18g",
    allergens: "Wheat, Eggs",
    dietaryTypes: ["vegetarian"],
  },

  // === DESSERTS ===
  {
    id: uuidv7(),
    name: "Matcha Tiramisu",
    slug: "matcha-tiramisu",
    description:
      "A Japanese twist on the Italian classic - layers of matcha-soaked ladyfingers with mascarpone cream, dusted with ceremonial grade matcha powder and white chocolate shavings.",
    shortDescription: "Japanese-Italian fusion dessert",
    price: "9.99",
    category: "desserts",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 420, Protein: 8g, Carbs: 48g, Fat: 22g",
    allergens: "Dairy, Eggs, Wheat",
    dietaryTypes: ["vegetarian"],
    locationSlugs: ["san-francisco", "los-angeles", "seattle"],
  },
  {
    id: uuidv7(),
    name: "Churros con Chocolate",
    slug: "churros-con-chocolate",
    description:
      "Fresh-fried churros coated in cinnamon sugar, served with rich Mexican hot chocolate dipping sauce and dulce de leche. Crispy outside, fluffy inside.",
    shortDescription: "Cinnamon churros with chocolate sauce",
    price: "8.49",
    category: "desserts",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 520, Protein: 6g, Carbs: 68g, Fat: 26g",
    allergens: "Wheat, Dairy, Eggs",
    dietaryTypes: ["vegetarian"],
  },
  {
    id: uuidv7(),
    name: "Mochi Ice Cream Trio",
    slug: "mochi-ice-cream-trio",
    description:
      "Three pieces of house-made mochi ice cream - choose from green tea, black sesame, and strawberry. Chewy rice cake exterior with creamy ice cream inside.",
    shortDescription: "Three flavors of house-made mochi",
    price: "7.99",
    category: "desserts",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 280, Protein: 4g, Carbs: 42g, Fat: 10g",
    allergens: "Dairy, Sesame",
    dietaryTypes: ["vegetarian", "gluten-free"],
    customizations: [
      {
        name: "Flavors",
        type: "multi-select",
        required: true,
        options: [
          "Green Tea",
          "Black Sesame",
          "Strawberry",
          "Mango",
          "Chocolate",
        ],
      },
    ],
  },
  {
    id: uuidv7(),
    name: "Baklava Cheesecake",
    slug: "baklava-cheesecake",
    description:
      "Rich New York cheesecake infused with honey and cardamom, topped with layers of crispy phyllo, crushed pistachios, and a drizzle of rose water syrup.",
    shortDescription: "Honey cheesecake with pistachio phyllo",
    price: "10.99",
    category: "desserts",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 580, Protein: 10g, Carbs: 52g, Fat: 38g",
    allergens: "Dairy, Eggs, Wheat, Tree Nuts",
    dietaryTypes: ["vegetarian"],
    locationSlugs: ["new-york"],
  },
  {
    id: uuidv7(),
    name: "Coconut Panna Cotta",
    slug: "coconut-panna-cotta",
    description:
      "Silky smooth coconut milk panna cotta topped with passion fruit coulis and toasted coconut flakes. A light, tropical finish to any meal.",
    shortDescription: "Coconut cream with passion fruit",
    price: "8.99",
    category: "desserts",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 320, Protein: 4g, Carbs: 32g, Fat: 20g",
    allergens: "Tree Nuts",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Warm Brownie Sundae",
    slug: "warm-brownie-sundae",
    description:
      "Dense fudgy brownie fresh from the oven, topped with vanilla bean ice cream, hot fudge sauce, whipped cream, and crushed peanuts.",
    shortDescription: "Fudgy brownie with ice cream and hot fudge",
    price: "9.49",
    category: "desserts",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 680, Protein: 10g, Carbs: 78g, Fat: 38g",
    allergens: "Dairy, Eggs, Wheat, Peanuts",
    dietaryTypes: ["vegetarian"],
  },

  // === DRINKS ===
  {
    id: uuidv7(),
    name: "Thai Iced Tea",
    slug: "thai-iced-tea",
    description:
      "Strong brewed Ceylon tea with star anise and vanilla, mixed with sweetened condensed milk and served over ice. Bright orange, creamy, and refreshing.",
    shortDescription: "Creamy Thai tea with condensed milk",
    price: "4.99",
    category: "drinks",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 180, Protein: 4g, Carbs: 32g, Fat: 4g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Lavender Lemonade",
    slug: "lavender-lemonade",
    description:
      "House-made lemonade infused with culinary lavender and a hint of honey. Light, floral, and perfectly balanced between sweet and tart.",
    shortDescription: "Floral lemonade with a honey finish",
    price: "4.49",
    category: "drinks",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 120, Protein: 0g, Carbs: 32g, Fat: 0g",
    allergens: "",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Horchata",
    slug: "horchata",
    description:
      "Traditional Mexican rice drink with cinnamon, vanilla, and a touch of almond. Creamy, sweet, and incredibly refreshing.",
    shortDescription: "Traditional cinnamon rice drink",
    price: "3.99",
    category: "drinks",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 160, Protein: 2g, Carbs: 36g, Fat: 2g",
    allergens: "Tree Nuts",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Mango Lassi",
    slug: "mango-lassi",
    description:
      "Thick and creamy Indian yogurt drink blended with Alphonso mango puree, a hint of cardamom, and a drizzle of honey.",
    shortDescription: "Creamy mango yogurt smoothie",
    price: "5.49",
    category: "drinks",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 220, Protein: 8g, Carbs: 42g, Fat: 4g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Vietnamese Coffee",
    slug: "vietnamese-coffee",
    description:
      "Dark roasted coffee dripped through a traditional phin filter over sweetened condensed milk, then poured over ice. Bold, sweet, and utterly addictive.",
    shortDescription: "Phin-dripped coffee with condensed milk",
    price: "5.99",
    category: "drinks",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 180, Protein: 4g, Carbs: 28g, Fat: 6g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
    locationSlugs: ["san-francisco", "los-angeles"],
  },
  {
    id: uuidv7(),
    name: "Fresh Watermelon Juice",
    slug: "fresh-watermelon-juice",
    description:
      "Cold-pressed watermelon juice with a squeeze of lime and a sprig of fresh mint. Light, hydrating, and perfect for hot days.",
    shortDescription: "Cold-pressed watermelon with lime",
    price: "5.49",
    category: "drinks",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 80, Protein: 1g, Carbs: 20g, Fat: 0g",
    allergens: "",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Sparkling Hibiscus",
    slug: "sparkling-hibiscus",
    description:
      "Brewed hibiscus tea with ginger and lime, topped with sparkling water. Ruby red, tangy, and naturally caffeine-free.",
    shortDescription: "Sparkling hibiscus tea with ginger",
    price: "4.99",
    category: "drinks",
    isAvailable: true,
    featured: false,
    nutritionalInfo: "Calories: 60, Protein: 0g, Carbs: 16g, Fat: 0g",
    allergens: "",
    dietaryTypes: ["vegetarian", "vegan", "gluten-free"],
  },
  {
    id: uuidv7(),
    name: "Chai Latte",
    slug: "chai-latte",
    description:
      "House-made chai with black tea, cardamom, cinnamon, ginger, and cloves, steamed with your choice of milk. Aromatic and warming.",
    shortDescription: "Spiced chai with steamed milk",
    price: "5.49",
    category: "drinks",
    isAvailable: true,
    featured: true,
    nutritionalInfo: "Calories: 140, Protein: 6g, Carbs: 22g, Fat: 4g",
    allergens: "Dairy",
    dietaryTypes: ["vegetarian", "gluten-free"],
    customizations: [
      {
        name: "Milk Choice",
        type: "select",
        required: false,
        options: ["Whole Milk", "Oat Milk", "Almond Milk", "Coconut Milk"],
      },
    ],
  },
];

async function generateAndUploadImage(
  slug: string,
  name: string,
  description: string,
): Promise<string | null> {
  try {
    const prompt = `Professional food photography of "${name}": ${description.slice(0, 200)}. Overhead shot on a rustic wooden table, natural lighting, shallow depth of field, appetizing presentation, restaurant quality, 4K, photorealistic`;

    console.log(`  Generating image for "${name}"...`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    const base64Data = response.data?.[0]?.b64_json;
    if (!base64Data) {
      console.log(`  Warning: No image data returned for "${name}"`);
      return null;
    }

    // Convert base64 to buffer for upload
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Upload to Vercel Blob
    console.log(`  Uploading to Vercel Blob...`);
    const blob = await put(`menu-items/${slug}.png`, imageBuffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });

    console.log(`  Uploaded: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`  Error generating/uploading image for "${name}":`, error);
    return null;
  }
}

async function seed() {
  console.log("Seeding food items with AI-generated images...\n");

  // Get all locations
  const allLocations = await db.select().from(locations);
  if (allLocations.length === 0) {
    console.error("No locations found! Please run seed-locations.ts first.\n");
    process.exit(1);
  }

  console.log(`Found ${allLocations.length} locations:`);
  for (const loc of allLocations) {
    console.log(`  - ${loc.name} (${loc.slug})`);
  }
  console.log("");

  const locationMap = new Map(allLocations.map((loc) => [loc.slug, loc.id]));

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < foodItems.length; i++) {
    const item = foodItems[i];
    console.log(`[${i + 1}/${foodItems.length}] Processing: ${item.name}`);

    // Generate AI image and upload to Vercel Blob
    const imageUrl = await generateAndUploadImage(
      item.slug,
      item.name,
      item.description,
    );

    // Prepare menu item data
    const menuItemData = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      shortDescription: item.shortDescription,
      price: item.price,
      image: imageUrl,
      category: item.category,
      isAvailable: item.isAvailable,
      featured: item.featured,
      nutritionalInfo: item.nutritionalInfo,
      allergens: item.allergens,
    };

    try {
      // Insert menu item
      await db.insert(menuItems).values(menuItemData);

      // Insert dietary types
      if (item.dietaryTypes.length > 0) {
        await db.insert(menuItemDietaryTypes).values(
          item.dietaryTypes.map((type) => ({
            id: uuidv7(),
            menuItemId: item.id,
            dietaryType: type,
          })),
        );
      }

      // Insert customization options
      if (item.customizations && item.customizations.length > 0) {
        await db.insert(customizationOptions).values(
          item.customizations.map((custom) => ({
            id: uuidv7(),
            menuItemId: item.id,
            name: custom.name,
            type: custom.type,
            required: custom.required,
            options: custom.options ? JSON.stringify(custom.options) : null,
            priceModifier: custom.priceModifier,
          })),
        );
      }

      // Determine which locations serve this item
      const targetLocations =
        item.locationSlugs && item.locationSlugs.length > 0
          ? item.locationSlugs
          : allLocations.map((loc) => loc.slug);

      // Insert menu item location mappings
      const locationMappings = targetLocations
        .map((slug) => {
          const locationId = locationMap.get(slug);
          if (!locationId) return null;
          return {
            id: uuidv7(),
            menuItemId: item.id,
            locationId,
            isAvailable: true,
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        menuItemId: string;
        locationId: string;
        isAvailable: boolean;
      }>;

      if (locationMappings.length > 0) {
        await db.insert(menuItemLocations).values(locationMappings);
      }

      const locationNames = targetLocations.join(", ");
      console.log(`  Saved to DB (locations: ${locationNames})`);
      successCount++;
    } catch (error) {
      console.error(`  Error saving "${item.name}":`, error);
      failedCount++;
    }

    // Small delay between API calls to avoid rate limiting
    if (i < foodItems.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Seeding complete!`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log("=".repeat(50));

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
