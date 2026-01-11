import { test, expect } from "./fixtures";

test.describe("Authentication", () => {
  test.describe("Sign In Page", () => {
    test("displays sign in form", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in/i }),
      ).toBeVisible();
    });

    test("has forgot password link", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page.getByRole("link", { name: /forgot/i })).toBeVisible();
    });

    test("forgot password link navigates to reset page", async ({ page }) => {
      await page.goto("/sign-in");
      await page.getByRole("link", { name: /forgot/i }).click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test("has sign up link", async ({ page }) => {
      await page.goto("/sign-in");

      // Look for any link that leads to sign up
      const signUpLink = page.locator('a[href="/sign-up"]');
      await expect(signUpLink).toBeVisible();
    });
  });

  test.describe("Sign Up Page", () => {
    test("displays sign up form", async ({ page }) => {
      await page.goto("/sign-up");

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
    });

    test("has sign in link", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.locator('a[href="/sign-in"]');
      await expect(signInLink).toBeVisible();
    });

    test("sign in link navigates to sign in page", async ({ page }) => {
      await page.goto("/sign-up");
      await page.locator('a[href="/sign-in"]').click();
      await expect(page).toHaveURL(/\/sign-in/);
    });
  });

  test.describe("Forgot Password Page", () => {
    test("displays forgot password form", async ({ page }) => {
      await page.goto("/forgot-password");

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /reset|send/i }),
      ).toBeVisible();
    });
  });

  test.describe("Reset Password Page", () => {
    test("displays reset password form or error state", async ({ page }) => {
      // This page requires a token, so without one it shows error
      await page.goto("/reset-password");

      // Should show either the form or an error about missing/invalid token
      const passwordInput = page.getByLabel(/password/i);
      const errorMessage = page.locator("text=/invalid|expired|token|error/i");
      const requestNewLink = page.getByRole("link", {
        name: /request|forgot|new link/i,
      });

      const hasForm = await passwordInput.isVisible().catch(() => false);
      const hasError = await errorMessage.isVisible().catch(() => false);
      const hasRequestLink = await requestNewLink
        .isVisible()
        .catch(() => false);

      expect(hasForm || hasError || hasRequestLink).toBe(true);
    });
  });

  test.describe("Verify Email Page", () => {
    test("displays verify email page or error state", async ({ page }) => {
      // Without a valid token, should show error or prompt
      await page.goto("/verify-email");

      // Should show verification message, error, or sign in prompt
      const verifyMessage = page.locator(
        "text=/verify|verification|email|confirm/i",
      );
      const errorMessage = page.locator("text=/invalid|expired|error|token/i");
      const signInLink = page.getByRole("link", { name: /sign in/i });

      const hasVerifyMessage = await verifyMessage
        .first()
        .isVisible()
        .catch(() => false);
      const hasError = await errorMessage
        .first()
        .isVisible()
        .catch(() => false);
      const hasSignIn = await signInLink.isVisible().catch(() => false);

      expect(hasVerifyMessage || hasError || hasSignIn).toBe(true);
    });

    test("has link back to sign in", async ({ page }) => {
      await page.goto("/verify-email");

      // Should have a sign in link somewhere
      const signInLink = page.locator('a[href="/sign-in"]');
      const backLink = page.getByRole("link", { name: /sign in|back|home/i });

      const hasDirectLink = await signInLink.isVisible().catch(() => false);
      const hasBackLink = await backLink.isVisible().catch(() => false);

      expect(hasDirectLink || hasBackLink).toBe(true);
    });
  });

  test.describe("Header Auth State", () => {
    test("header has user authentication area", async ({ page }) => {
      await page.goto("/");

      // Header should be visible
      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Wait for hydration
      await page.waitForTimeout(1000);

      // Check for auth-related elements (either sign in or user menu)
      const signInLink = header.locator('a[href="/sign-in"]');
      const getStartedLink = header.locator('a[href="/sign-up"]');
      const signInButton = header.getByRole("link", { name: /sign in/i });
      const avatar = header.locator('[class*="avatar"]');
      const skeleton = header.locator('[class*="skeleton"]'); // Loading state

      const hasSignIn = await signInLink.isVisible().catch(() => false);
      const hasGetStarted = await getStartedLink.isVisible().catch(() => false);
      const hasSignInButton = await signInButton.isVisible().catch(() => false);
      const hasAvatar = await avatar.isVisible().catch(() => false);
      const hasSkeleton = await skeleton.isVisible().catch(() => false);

      // Either sign in options, user menu, or loading skeleton should be present
      expect(
        hasSignIn ||
          hasGetStarted ||
          hasSignInButton ||
          hasAvatar ||
          hasSkeleton,
      ).toBe(true);
    });
  });

  test.describe("User Menu (Authenticated)", () => {
    test("unauthenticated user sees sign in/sign up buttons", async ({
      page,
    }) => {
      await page.goto("/");

      // Wait for hydration
      await page.waitForTimeout(1000);

      const header = page.locator("header");
      const signInLink = header.locator('a[href="/sign-in"]');
      const getStartedLink = header.locator('a[href="/sign-up"]');

      const hasSignIn = await signInLink.isVisible().catch(() => false);
      const hasGetStarted = await getStartedLink.isVisible().catch(() => false);

      expect(hasSignIn || hasGetStarted).toBe(true);
    });
  });
});
