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

      // CTAs
      await expect(
        page.getByRole("link", { name: /Order Now/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /See Our Menu/i }),
      ).toBeVisible();
    });

    test("Order Now navigates to menu page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /Order Now/i }).click();
      await expect(page).toHaveURL("/menu");
    });

    test("See Our Menu navigates to menu page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /See Our Menu/i }).click();
      await expect(page).toHaveURL("/menu");
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
      await expect(page.getByText("Classic Mac & Cheese")).toBeVisible();
    });

    test("View Full Menu navigates to menu page", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: /View Full Menu/i }).click();
      await expect(page).toHaveURL("/menu");
    });
  });

  test.describe("Testimonials Section", () => {
    test("displays customer testimonials", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /What Our Neighbors Say/i }),
      ).toBeVisible();
      await expect(page.getByText(/Sarah M\./)).toBeVisible();
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

  test.describe("Newsletter Section", () => {
    test("displays newsletter signup form", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: /Join the Kitchen Family/i }),
      ).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Subscribe/i }),
      ).toBeVisible();
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
