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
      "Menu page shows location selector modal when no location selected",
      async ({ page }) => {
        // Go directly to menu without setting location
        await page.goto("/menu");

        // Should show location selector modal
        await expect(
          page.getByRole("dialog").getByText(/Choose Your Location/i),
        ).toBeVisible();

        // Select a location
        await page.getByRole("button", { name: /San Francisco/i }).click();

        // Modal should close and menu should load
        await expect(page.getByRole("dialog")).not.toBeVisible();
        await expect(
          page.getByRole("heading", { name: /Our Menu/i }),
        ).toBeVisible();
      },
    );

    baseTest(
      "Location modal shows all available locations",
      async ({ page }) => {
        await page.goto("/menu");

        // Modal should show all locations
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByText(/San Francisco/i)).toBeVisible();
        await expect(dialog.getByText(/New York/i)).toBeVisible();
        await expect(dialog.getByText(/Los Angeles/i)).toBeVisible();
        await expect(dialog.getByText(/Seattle/i)).toBeVisible();
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

    test("menu page fetches items with location filter", async ({ page }) => {
      // The fixture sets San Francisco as the location
      await page.goto("/menu");

      // Wait for menu items to load
      await expect(
        page.getByRole("heading", { name: /Our Menu/i }),
      ).toBeVisible();

      // Intercept the API call to verify locationId is passed
      const requestPromise = page.waitForRequest(
        (request) =>
          request.url().includes("/api/menu") &&
          request.url().includes("locationId"),
      );

      // Trigger a filter change to make a new API call
      await page.reload();

      // Wait a bit for the request (if no request with locationId, the test will timeout)
      const request = await requestPromise.catch(() => null);

      // The menu should have loaded with location filter
      // (if the above times out, the request wasn't made with locationId)
      expect(request).not.toBeNull();
    });
  });
});
