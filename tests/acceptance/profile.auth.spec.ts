import { test, expect } from "./fixtures";

/**
 * Authenticated tests for the profile page.
 * These tests run with a pre-authenticated user session (see auth.setup.ts).
 * File naming: *.auth.spec.ts triggers the "authenticated" project in playwright.config.ts
 */

test.describe("Authenticated Profile", () => {
  test("authenticated user can access profile page", async ({ page }) => {
    await page.goto("/profile");

    // Should not redirect to sign-in
    await expect(page).not.toHaveURL(/sign-in/);

    // Should see profile content
    await expect(
      page.getByRole("heading", { name: /profile|settings|account/i }),
    ).toBeVisible();
  });

  test("authenticated user sees their email", async ({ page }) => {
    await page.goto("/profile");

    // The profile page should display the user's email somewhere
    const emailElement = page.locator("text=@example.com");
    await expect(emailElement).toBeVisible();
  });

  test("header shows user menu instead of sign in", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const header = page.locator("header");

    // Should NOT see sign in link (give time for client-side session check)
    await page.waitForTimeout(2000);
    const signInLink = header.locator('a[href="/sign-in"]');
    await expect(signInLink).not.toBeVisible();

    // Should see user avatar button (the dropdown trigger)
    // The avatar button is a rounded-full button containing the user's initials or avatar image
    const avatarButton = header
      .locator('button[class*="rounded-full"]')
      .first();
    await expect(avatarButton).toBeVisible();

    // Click the avatar to open the dropdown
    await avatarButton.click();

    // Should see the Settings link to /profile in the dropdown
    const profileLink = page.locator('a[href="/profile"]');
    await expect(profileLink.first()).toBeVisible();
  });

  test("sign-in page redirects authenticated user", async ({ page }) => {
    await page.goto("/sign-in");

    // Should redirect away from sign-in
    await page.waitForURL(/\/(menu|profile|$)/, { timeout: 5000 });
    expect(page.url()).not.toContain("/sign-in");
  });
});
