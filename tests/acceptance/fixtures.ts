import { test as base, expect, Page } from "@playwright/test";

// San Francisco location - ID from the seeded database
// Note: If this ID doesn't match your database, run the seed script or query /api/locations
const DEFAULT_LOCATION = {
  id: "rg2m8n5o1prfj04ymihztroc",
  name: "San Francisco",
  slug: "san-francisco",
  city: "San Francisco",
  state: "CA",
  isOpen: true,
};

// Extend base test to set location in localStorage and cookie before each test
export const test = base.extend({
  page: async ({ page, context, baseURL }, use) => {
    // Set the location cookie for server-side rendering (menu page reads this)
    await context.addCookies([
      {
        name: "location-id",
        value: DEFAULT_LOCATION.id,
        url: baseURL || "http://localhost:3000",
      },
    ]);

    // Set location in localStorage before navigating (for client-side context)
    await page.addInitScript((location) => {
      localStorage.setItem(
        "caspers-kitchen-location",
        JSON.stringify(location),
      );
    }, DEFAULT_LOCATION);

    await use(page);
  },
});

export { expect };
