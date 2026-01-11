import { test as base, expect, Page } from "@playwright/test";

// Default location to use for tests
const DEFAULT_LOCATION = {
  id: "loc_sf",
  name: "San Francisco",
  slug: "san-francisco",
  city: "San Francisco",
  state: "CA",
  isOpen: true,
};

// Extend base test to set location in localStorage before each test
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set location in localStorage before navigating
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
