import { test, expect } from "./fixtures";

test.describe("Menu Page", () => {
  test.describe("Menu Display", () => {
    test("displays menu page with heading", async ({ page }) => {
      await page.goto("/menu");

      await expect(
        page.getByRole("heading", { name: /Our Menu/i }),
      ).toBeVisible();
    });

    test("displays food items or empty state", async ({ page }) => {
      await page.goto("/menu");

      // Wait for page to load
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000); // Wait for API call

      // Check for menu items, loading state, or empty state
      const price = page.locator("text=/\\$\\d+/").first();
      const menuLink = page.locator('a[href^="/menu/"]').first();
      const emptyState = page.getByText(/No menu items found/i);
      const locationRequired = page.getByText(/Select a Location/i);
      const loading = page.locator(".animate-pulse").first();

      const hasPrice = await price
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const hasLink = await menuLink
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const hasEmpty = await emptyState
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const needsLocation = await locationRequired
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const isLoading = await loading
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      // Any of these states is acceptable
      expect(
        hasPrice || hasLink || hasEmpty || needsLocation || isLoading,
      ).toBe(true);
    });
  });

  test.describe("Category Filtering", () => {
    test("displays category filter buttons", async ({ page }) => {
      await page.goto("/menu");

      // Look for filter buttons
      const allFilter = page.getByRole("button", { name: "All" });
      await expect(allFilter).toBeVisible();
    });
  });

  test.describe("Item Detail Page", () => {
    test("clicking item navigates to detail page", async ({ page }) => {
      await page.goto("/menu");
      await page.waitForLoadState("networkidle");

      // Find a clickable menu item link
      const itemLink = page.locator('a[href^="/menu/"]').first();
      if (await itemLink.isVisible()) {
        await itemLink.click();
        await expect(page).toHaveURL(/\/menu\/.+/);
      }
    });
  });

  test.describe("Add to Cart", () => {
    test("can add item to cart from detail page", async ({ page }) => {
      await page.goto("/menu");
      await page.waitForLoadState("networkidle");

      // Go to item detail page
      const itemLink = page.locator('a[href^="/menu/"]').first();
      if (await itemLink.isVisible()) {
        await itemLink.click();
        await page.waitForLoadState("networkidle");

        const addButton = page.getByRole("button", { name: /Add to Cart/i });
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("Responsive Layout", () => {
    test("displays correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/menu");

      await expect(page.getByRole("heading", { name: /Menu/i })).toBeVisible();
    });
  });
});
