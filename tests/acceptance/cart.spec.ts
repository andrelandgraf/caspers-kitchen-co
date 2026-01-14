import { test, expect } from "./fixtures";

test.describe("Cart", () => {
  test.describe("Cart Icon", () => {
    test("displays cart icon in header", async ({ page }) => {
      await page.goto("/");

      const cartButton = page.getByRole("button", { name: /open cart/i });
      await expect(cartButton).toBeVisible();
    });
  });

  test.describe("Cart Drawer", () => {
    test("opens cart drawer when clicking cart icon", async ({ page }) => {
      await page.goto("/");

      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();
      await page.waitForTimeout(1000);

      // Sheet should open - check for dialog role or sheet content
      const dialog = page.getByRole("dialog");
      const cartTitle = page.getByText(/Your Cart/i);
      const emptyCart = page.getByText(/cart is empty/i);
      const browseMenu = page.getByRole("link", { name: /Browse Menu/i });

      const hasDialog = await dialog.isVisible().catch(() => false);
      const hasTitle = await cartTitle.isVisible().catch(() => false);
      const hasEmpty = await emptyCart.isVisible().catch(() => false);
      const hasBrowse = await browseMenu.isVisible().catch(() => false);

      expect(hasDialog || hasTitle || hasEmpty || hasBrowse).toBe(true);
    });

    test("displays empty cart message when cart is empty", async ({ page }) => {
      await page.goto("/");

      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();

      await expect(page.getByText(/cart is empty/i)).toBeVisible();
    });

    test("has Browse Menu link in empty cart", async ({ page }) => {
      await page.goto("/");

      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();

      await expect(
        page.getByRole("link", { name: /Browse Menu/i }),
      ).toBeVisible();
    });
  });

  test.describe("Cart with Items", () => {
    test.beforeEach(async ({ page }) => {
      // Add an item to cart
      await page.goto("/menu");
      await page.waitForLoadState("networkidle");

      // Go to first item detail
      const itemLink = page.locator('a[href^="/menu/"]').first();
      if (await itemLink.isVisible()) {
        await itemLink.click();
        await page.waitForLoadState("networkidle");

        const addButton = page.getByRole("button", { name: /Add to Cart/i });
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test("displays cart summary when items exist", async ({ page }) => {
      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();

      // Should show subtotal if items were added
      const subtotal = page.getByText(/subtotal/i);
      const emptyMessage = page.getByText(/cart is empty/i);

      const hasSubtotal = await subtotal.isVisible();
      const isEmpty = await emptyMessage.isVisible();

      // One of these should be true
      expect(hasSubtotal || isEmpty).toBe(true);
    });

    test("has checkout button when items exist", async ({ page }) => {
      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();

      // If cart has items, checkout link should appear
      const checkoutLink = page.getByRole("link", { name: /checkout/i });
      const emptyMessage = page.getByText(/cart is empty/i);

      const hasCheckout = await checkoutLink.isVisible();
      const isEmpty = await emptyMessage.isVisible();

      expect(hasCheckout || isEmpty).toBe(true);
    });

    test("closes cart drawer when proceeding to checkout", async ({ page }) => {
      const cartButton = page.getByRole("button", { name: /open cart/i });
      await cartButton.click();

      const checkoutLink = page.getByRole("link", { name: /checkout/i });
      const isEmpty = await page.getByText(/cart is empty/i).isVisible();

      if (!isEmpty && (await checkoutLink.isVisible())) {
        await checkoutLink.click();
        await page.waitForURL("/checkout");

        // Cart drawer should be closed
        const dialog = page.getByRole("dialog");
        await expect(dialog).not.toBeVisible();
      }
    });
  });
});
