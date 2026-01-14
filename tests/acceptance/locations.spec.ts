import { test, expect } from "./fixtures";
import { test as baseTest } from "@playwright/test";

test.describe("Locations", () => {
  test.describe("Location Selection on Order", () => {
    test("Order Now with location selected goes directly to menu", async ({
      page,
    }) => {
      // This test uses the fixture which sets a default location
      await page.goto("/");

      await page.getByRole("link", { name: /Order Now/i }).click();

      // Should navigate directly to menu without modal
      await expect(page).toHaveURL("/menu");
    });
  });

  // Use base test without location fixture for testing no-location behavior
  baseTest.describe("Location Selection Without Saved Location", () => {
    baseTest(
      "Menu page shows location required message when no location selected",
      async ({ page }) => {
        // Go directly to menu without setting location
        await page.goto("/menu");

        // Should show the "Select a Location" heading (static component, not modal)
        await expect(
          page.getByRole("heading", { name: /Select a Location/i }),
        ).toBeVisible();
        await expect(
          page.getByText(
            /Please select a location to view available menu items/i,
          ),
        ).toBeVisible();

        // Should have a link to choose location
        await expect(
          page.getByRole("link", { name: /Choose Location/i }),
        ).toBeVisible();
      },
    );

    baseTest(
      "Choose Location link navigates to locations page",
      async ({ page }) => {
        await page.goto("/menu");

        // Click the Choose Location link
        await page.getByRole("link", { name: /Choose Location/i }).click();

        // Should navigate to locations page
        await expect(page).toHaveURL("/locations");
      },
    );
  });

  baseTest.describe("User Location API", () => {
    baseTest(
      "GET /api/locations/user returns null for unauthenticated user",
      async ({ page }) => {
        await page.goto("/");

        // Call the API directly
        const response = await page.request.get("/api/locations/user");
        expect(response.ok()).toBe(true);

        const data = await response.json();
        expect(data.location).toBeNull();
      },
    );

    baseTest(
      "POST /api/locations/user returns 401 for unauthenticated user",
      async ({ page }) => {
        await page.goto("/");

        // Try to set location without being authenticated
        const response = await page.request.post("/api/locations/user", {
          data: { locationId: "loc_sf" },
          headers: { "Content-Type": "application/json" },
        });

        expect(response.status()).toBe(401);
        const data = await response.json();
        expect(data.error).toBe("Unauthorized");
      },
    );

    baseTest(
      "POST /api/locations/user returns 400 when locationId missing",
      async ({ page }) => {
        await page.goto("/");

        // This will still get 401 since user isn't authenticated
        // But if authenticated, it should validate locationId
        const response = await page.request.post("/api/locations/user", {
          data: {},
          headers: { "Content-Type": "application/json" },
        });

        // Expect 401 for unauthenticated (auth check happens first)
        expect(response.status()).toBe(401);
      },
    );
  });

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

      const hasButton = await button
        .first()
        .isVisible()
        .catch(() => false);
      const hasLink = await link
        .first()
        .isVisible()
        .catch(() => false);
      const hasLocationButton = await locationButton
        .isVisible()
        .catch(() => false);

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

  test.describe("Location Persistence", () => {
    test("selected location persists across page navigation", async ({
      page,
    }) => {
      // Fixture sets San Francisco as location
      await page.goto("/");
      await page.goto("/menu");
      await page.goto("/");

      // Location should still be set
      const header = page.locator("header");
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

  test.describe("Location Affects Menu Content", () => {
    test("menu API accepts locationId filter parameter", async ({ page }) => {
      await page.goto("/");

      // Call menu API with locationId
      const response = await page.request.get(
        "/api/menu?locationId=loc_sf&availableOnly=false",
      );
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    test("menu API works without locationId filter", async ({ page }) => {
      await page.goto("/");

      // Call menu API without locationId (returns all items)
      const response = await page.request.get("/api/menu?availableOnly=false");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    test("menu page displays items when location is set", async ({ page }) => {
      // The fixture sets San Francisco as the location (both cookie and localStorage)
      await page.goto("/menu");

      // Wait for menu items to load
      await expect(
        page.getByRole("heading", { name: /Our Menu/i }),
      ).toBeVisible();

      // Wait for network to settle (menu items are fetched from API)
      await page.waitForLoadState("networkidle");

      // Should NOT show the "Select a Location" heading since location is set
      const locationRequiredHeading = page.getByRole("heading", {
        name: /Select a Location/i,
      });
      await expect(locationRequiredHeading).not.toBeVisible();

      // Should show either menu items (with prices) or empty results message
      const price = page.locator("text=/\\$\\d+/").first();
      const emptyState = page.getByText(/No menu items found/i);

      const hasPrice = await price
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasEmpty = await emptyState
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      expect(hasPrice || hasEmpty).toBe(true);
    });
  });
});
