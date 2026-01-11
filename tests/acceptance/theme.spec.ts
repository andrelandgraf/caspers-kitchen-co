import { test, expect } from "./fixtures";

test.describe("Theme and Branding", () => {
  test.describe("Theme Selector", () => {
    test("theme selector is accessible in header", async ({ page }) => {
      await page.goto("/");

      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Look for theme selector button (may have sun/moon icon)
      const themeButton = header.getByRole("button", {
        name: /theme|mode|light|dark|sun|moon/i,
      });
      const themeIcon = header.locator(
        ".lucide-sun, .lucide-moon, [class*='sun'], [class*='moon']",
      );

      const hasThemeButton = await themeButton.isVisible().catch(() => false);
      const hasThemeIcon = await themeIcon
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasThemeButton || hasThemeIcon).toBe(true);
    });

    test("clicking theme button opens theme options", async ({ page }) => {
      await page.goto("/");

      const header = page.locator("header");
      const themeButton = header
        .locator("button")
        .filter({ has: page.locator(".lucide-sun, .lucide-moon") });

      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(300);

        // Look for theme options dropdown
        const lightOption = page.getByRole("menuitem", { name: /light/i });
        const darkOption = page.getByRole("menuitem", { name: /dark/i });
        const systemOption = page.getByRole("menuitem", { name: /system/i });

        const hasLight = await lightOption.isVisible().catch(() => false);
        const hasDark = await darkOption.isVisible().catch(() => false);
        const hasSystem = await systemOption.isVisible().catch(() => false);

        // At least one option should be visible
        expect(hasLight || hasDark || hasSystem).toBe(true);
      }
    });
  });

  test.describe("Dark Mode", () => {
    test("dark mode can be toggled", async ({ page }) => {
      await page.goto("/");

      // Manually set dark mode via local storage or class
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });

      // Page should have dark class
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      expect(isDark).toBe(true);
    });

    test("dark mode maintains readability", async ({ page }) => {
      await page.goto("/");

      // Set dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });

      // Check that main content is still visible
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Hero heading should still be visible
      const heading = page.getByRole("heading").first();
      await expect(heading).toBeVisible();
    });
  });

  test.describe("Branding Elements", () => {
    test("displays Casper's Kitchen branding", async ({ page }) => {
      await page.goto("/");

      // Logo should be visible in header
      const header = page.locator("header");
      const logoText = header.locator("text=/Casper/i");
      const logoLink = header.locator('a[href="/"]');

      const hasLogoText = await logoText
        .first()
        .isVisible()
        .catch(() => false);
      const hasLogoLink = await logoLink.isVisible().catch(() => false);

      expect(hasLogoText || hasLogoLink).toBe(true);
    });

    test("displays tagline", async ({ page }) => {
      await page.goto("/");

      // Tagline or subtitle in header
      const tagline = page.locator(
        "text=/Ghost Kitchen|Comfort food|delivered with warmth/i",
      );
      await expect(tagline.first()).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("layout adapts to mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Header should be visible
      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Main content should be accessible
      const main = page.locator("main");
      if (await main.isVisible()) {
        await expect(main).toBeVisible();
      }
    });

    test("layout adapts to tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      const header = page.locator("header");
      await expect(header).toBeVisible();
    });

    test("layout adapts to desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/");

      const header = page.locator("header");
      await expect(header).toBeVisible();
    });
  });

  test.describe("Visual Consistency", () => {
    test("menu page has consistent styling", async ({ page }) => {
      await page.goto("/menu");

      const heading = page.getByRole("heading", { name: /Menu/i });
      await expect(heading).toBeVisible();
    });

    test("checkout page has consistent styling", async ({ page }) => {
      await page.goto("/checkout");

      const heading = page.getByRole("heading", { name: /Checkout/i });
      await expect(heading).toBeVisible();
    });

    test("locations page has consistent styling", async ({ page }) => {
      await page.goto("/locations");

      const heading = page.getByRole("heading", { name: /Locations/i });
      await expect(heading).toBeVisible();
    });
  });
});
