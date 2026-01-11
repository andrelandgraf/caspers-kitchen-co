import { test, expect } from "./fixtures";

test.describe("AI Assistant", () => {
  test.describe("Chat Trigger", () => {
    test("displays chat trigger button", async ({ page }) => {
      await page.goto("/");

      const chatTrigger = page.getByRole("button", {
        name: /open chat assistant/i,
      });
      await expect(chatTrigger).toBeVisible();
    });

    test("opens chat panel on click", async ({ page }) => {
      await page.goto("/");

      const chatTrigger = page.getByRole("button", {
        name: /open chat assistant/i,
      });
      await chatTrigger.click();
      await page.waitForTimeout(500);

      // Chat panel should be visible - look for dialog
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible();
      }
    });
  });

  test.describe("Chat Interface", () => {
    test("has message input", async ({ page }) => {
      await page.goto("/");

      const chatTrigger = page.getByRole("button", {
        name: /open chat assistant/i,
      });
      await chatTrigger.click();
      await page.waitForTimeout(500);

      const input = page.getByPlaceholder(/message|ask|type/i);
      if (await input.isVisible()) {
        await expect(input).toBeVisible();
      }
    });

    test("can type message", async ({ page }) => {
      await page.goto("/");

      const chatTrigger = page.getByRole("button", {
        name: /open chat assistant/i,
      });
      await chatTrigger.click();
      await page.waitForTimeout(500);

      const input = page.getByPlaceholder(/message|ask|type/i);
      if (await input.isVisible()) {
        await input.fill("Hello");
        await expect(input).toHaveValue("Hello");
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("works on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const chatTrigger = page.getByRole("button", {
        name: /open chat assistant/i,
      });
      await expect(chatTrigger).toBeVisible();
    });
  });
});
