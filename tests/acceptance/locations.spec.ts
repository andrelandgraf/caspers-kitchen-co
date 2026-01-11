import { test, expect } from "./fixtures";

test.describe("Locations", () => {
  test.describe("Locations Page", () => {
    test("displays locations page", async ({ page }) => {
      await page.goto("/locations");

      await expect(
        page.getByRole("heading", { name: /locations/i }),
      ).toBeVisible();
    });

    test("displays location options", async ({ page }) => {
      await page.goto("/locations");

      // Should show at least one city
      const locationText = page.locator(
        "text=/San Francisco|New York|Los Angeles|Seattle/i",
      );
      await expect(locationText.first()).toBeVisible();
    });

    test("has select/order buttons", async ({ page }) => {
      await page.goto("/locations");

      // Look for buttons to select/order from locations
      const button = page.getByRole("button", { name: /order|select|choose/i });
      const link = page.getByRole("link", { name: /order|select|menu/i });

      // Or look for any button in the location cards
      const locationButton = page.locator("button").first();

      const hasButton = await button.first().isVisible();
      const hasLink = await link.first().isVisible();
      const hasLocationButton = await locationButton.isVisible();

      expect(hasButton || hasLink || hasLocationButton).toBe(true);
    });
  });

  test.describe("Location Indicator", () => {
    test("header shows location indicator", async ({ page }) => {
      await page.goto("/");

      const header = page.locator("header");
      // Look for MapPin icon or Select Location text
      const locationButton = header.getByRole("button").filter({
        has: page.locator(".lucide-map-pin"),
      });

      await expect(locationButton).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("displays correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/locations");

      await expect(
        page.getByRole("heading", { name: /locations/i }),
      ).toBeVisible();
    });
  });
});
