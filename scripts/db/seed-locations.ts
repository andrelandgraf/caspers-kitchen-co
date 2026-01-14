import { db } from "@/lib/db/client";
import { locations, menuItemLocations } from "@/lib/locations/schema";
import { menuItems } from "@/lib/menu/schema";
import { v7 as uuidv7 } from "uuid";

// Use predictable IDs for testing and consistency
const locationsData = [
  {
    id: "loc_sf",
    name: "San Francisco",
    slug: "san-francisco",
    address: "123 Mission St",
    neighborhood: "Mission District",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    phone: "(415) 555-0101",
    email: "sf@casperskitchen.com",
    latitude: "37.7749",
    longitude: "-122.4194",
    operatingHours: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "10:00", close: "22:00" },
      friday: { open: "10:00", close: "23:00" },
      saturday: { open: "09:00", close: "23:00" },
      sunday: { open: "09:00", close: "22:00" },
    },
    deliveryFee: "5.99",
    deliveryZoneRadius: "10",
    deliveryZoneDescription: "Mission, SOMA, Downtown, Nob Hill, Russian Hill",
    description: "Our flagship kitchen in the heart of San Francisco",
    imageUrl: null,
  },
  {
    id: "loc_nyc",
    name: "New York",
    slug: "new-york",
    address: "456 Broadway",
    neighborhood: "SoHo",
    city: "New York",
    state: "NY",
    zipCode: "10013",
    phone: "(212) 555-0202",
    email: "nyc@casperskitchen.com",
    latitude: "40.7128",
    longitude: "-74.0060",
    operatingHours: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
      wednesday: { open: "09:00", close: "22:00" },
      thursday: { open: "09:00", close: "23:00" },
      friday: { open: "09:00", close: "23:00" },
      saturday: { open: "09:00", close: "23:00" },
      sunday: { open: "09:00", close: "22:00" },
    },
    deliveryFee: "6.99",
    deliveryZoneRadius: "8",
    deliveryZoneDescription:
      "SoHo, Tribeca, Greenwich Village, Chelsea, Lower East Side",
    description: "Bringing comfort food to the heart of Manhattan",
    imageUrl: null,
  },
  {
    id: "loc_la",
    name: "Los Angeles",
    slug: "los-angeles",
    address: "789 Sunset Blvd",
    neighborhood: "West Hollywood",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90069",
    phone: "(323) 555-0303",
    email: "la@casperskitchen.com",
    latitude: "34.0522",
    longitude: "-118.2437",
    operatingHours: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "10:00", close: "23:00" },
      friday: { open: "10:00", close: "23:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "10:00", close: "22:00" },
    },
    deliveryFee: "7.99",
    deliveryZoneRadius: "12",
    deliveryZoneDescription:
      "West Hollywood, Beverly Hills, Hollywood, Downtown LA",
    description: "Serving LA with love since 2024",
    imageUrl: null,
  },
  {
    id: "loc_seattle",
    name: "Seattle",
    slug: "seattle",
    address: "321 Pike St",
    neighborhood: "Capitol Hill",
    city: "Seattle",
    state: "WA",
    zipCode: "98122",
    phone: "(206) 555-0404",
    email: "seattle@casperskitchen.com",
    latitude: "47.6062",
    longitude: "-122.3321",
    operatingHours: {
      monday: { open: "10:00", close: "21:00" },
      tuesday: { open: "10:00", close: "21:00" },
      wednesday: { open: "10:00", close: "21:00" },
      thursday: { open: "10:00", close: "22:00" },
      friday: { open: "10:00", close: "22:00" },
      saturday: { open: "09:00", close: "22:00" },
      sunday: { open: "09:00", close: "21:00" },
    },
    deliveryFee: "5.99",
    deliveryZoneRadius: "10",
    deliveryZoneDescription:
      "Capitol Hill, Downtown, Queen Anne, Fremont, Ballard",
    description: "Bringing warmth to the Emerald City",
    imageUrl: null,
  },
];

async function seedLocations() {
  try {
    console.log("🌍 Seeding locations...");

    // Insert locations
    await db.insert(locations).values(locationsData);
    console.log(`✅ Seeded ${locationsData.length} locations`);

    // Make all menu items available at all locations
    const allMenuItems = await db.select({ id: menuItems.id }).from(menuItems);
    const menuItemLocationData = [];

    for (const location of locationsData) {
      for (const item of allMenuItems) {
        menuItemLocationData.push({
          id: uuidv7(),
          menuItemId: item.id,
          locationId: location.id,
          isAvailable: true,
        });
      }
    }

    if (menuItemLocationData.length > 0) {
      await db.insert(menuItemLocations).values(menuItemLocationData);
      console.log(
        `✅ Seeded ${menuItemLocationData.length} menu item location mappings`,
      );
    }

    console.log("✨ Locations seeded successfully!");
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  }
}

seedLocations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
