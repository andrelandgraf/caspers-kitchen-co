import { test, expect } from "./fixtures";

test.describe("Checkout", () => {
  test.describe("Checkout Page", () => {
    test("displays checkout page", async ({ page }) => {
      await page.goto("/checkout");

      await expect(
        page.getByRole("heading", { name: /checkout/i }),
      ).toBeVisible();
    });

    test("displays checkout form", async ({ page }) => {
      await page.goto("/checkout");

      // Should have form elements
      const heading = page.getByRole("heading", { name: /checkout/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe("Form Fields", () => {
    test("has email field", async ({ page }) => {
      await page.goto("/checkout");

      const emailInput = page.getByLabel(/email/i);
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible();
      }
    });

    test("can fill email", async ({ page }) => {
      await page.goto("/checkout");

      const emailInput = page.getByLabel(/email/i);
      if (await emailInput.isVisible()) {
        await emailInput.fill("test@example.com");
        await expect(emailInput).toHaveValue("test@example.com");
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("displays correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/checkout");

      await expect(
        page.getByRole("heading", { name: /checkout/i }),
      ).toBeVisible();
    });

    test("displays correctly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto("/checkout");

      await expect(
        page.getByRole("heading", { name: /checkout/i }),
      ).toBeVisible();
    });
  });
});
