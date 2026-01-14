import { test, expect } from "./fixtures";

test.describe("Landing Page", () => {
  test.describe("Hero Section", () => {
    test("displays hero with correct content and CTAs", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveTitle(/Casper/i);

      // Hero heading
      const heading = page.getByRole("heading", {
        name: /Comfort food.*delivered with warmth/i,
      });
      await expect(heading).toBeVisible();

      // CTAs - use first() to avoid strict mode violation (Sign In appears in both hero and header)
      await expect(
        page.getByRole("link", { name: /Order Now/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Sign In/i }).first(),
      ).toBeVisible();
    });

    test("Order Now navigates to menu page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /Order Now/i }).click();
      await expect(page).toHaveURL("/menu");
    });

    test("Sign In navigates to sign-in page", async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("link", { name: /Sign In/i })
        .first()
        .click();
      await expect(page).toHaveURL("/sign-in");
    });
  });

  test.describe("How It Works Section", () => {
    test("displays step-by-step process", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /How It Works/i }),
      ).toBeVisible();
      await expect(page.getByText("Browse Our Menu")).toBeVisible();
      await expect(page.getByText("Order Online")).toBeVisible();
    });
  });

  test.describe("Values Section", () => {
    test("displays core values", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /Made with Love/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Fresh Ingredients" }),
      ).toBeVisible();
    });
  });

  test.describe("Featured Menu Section", () => {
    test("displays featured dishes", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /Today's Favorites/i }),
      ).toBeVisible();

      // Check for any featured menu item (with price) or the fallback message
      const featuredCard = page.locator("text=/\\$\\d+/").first();
      const fallbackMessage = page.getByText(/Check out our full menu/i);

      const hasFeaturedItems = await featuredCard
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const hasFallback = await fallbackMessage
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      expect(hasFeaturedItems || hasFallback).toBe(true);
    });

    test("View Full Menu navigates to menu page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /View Full Menu/i }).click();
      await expect(page).toHaveURL("/menu");
    });
  });

  test.describe("Delivery Area Section", () => {
    test("displays delivery information", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /Delivering Fresh Food/i }),
      ).toBeVisible();
    });

    test("View All Locations navigates to locations page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /View All Locations/i }).click();
      await expect(page).toHaveURL("/locations");
    });
  });

  test.describe("Footer", () => {
    test("displays footer", async ({ page }) => {
      await page.goto("/");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  });

  test.describe("Header Navigation", () => {
    test("displays header", async ({ page }) => {
      await page.goto("/");

      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(header.getByText(/Casper/i)).toBeVisible();
    });
  });
});
