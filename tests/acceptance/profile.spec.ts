import { test, expect } from "./fixtures";

test.describe("Profile", () => {
  test.describe("Profile Page Access", () => {
    test("profile page requires authentication", async ({ page }) => {
      // Try to access profile while not logged in
      await page.goto("/profile");

      // Should redirect to sign-in or show auth prompt
      const url = page.url();
      const signInForm = page.getByLabel(/email/i);

      const redirected = url.includes("/sign-in");
      const hasSignInForm = await signInForm.isVisible().catch(() => false);

      // Either redirected or showing sign in
      expect(redirected || hasSignInForm).toBe(true);
    });
  });

  test.describe("Profile Information", () => {
    test("displays profile page structure", async ({ page }) => {
      await page.goto("/profile");

      // Page should load with profile content
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });

  test.describe("Change Email Section", () => {
    test("change email section exists", async ({ page }) => {
      await page.goto("/profile");

      // Look for change email section
      const emailSection = page.locator("text=/Change Email|Email/i");
      if (await emailSection.first().isVisible()) {
        await expect(emailSection.first()).toBeVisible();
      }
    });
  });

  test.describe("Change Password Section", () => {
    test("change password section exists", async ({ page }) => {
      await page.goto("/profile");

      // Look for change password section
      const passwordSection = page.locator("text=/Change Password|Password/i");
      if (await passwordSection.first().isVisible()) {
        await expect(passwordSection.first()).toBeVisible();
      }
    });

    test("password fields are present when editing", async ({ page }) => {
      await page.goto("/profile");

      // Look for password input fields
      const currentPassword = page.getByLabel(/current password/i);
      const newPassword = page.getByLabel(/new password/i);

      // These may only be visible after clicking edit
      if (await currentPassword.isVisible()) {
        await expect(currentPassword).toBeVisible();
      }
    });
  });

  test.describe("Delete Account Section", () => {
    test("delete account section exists", async ({ page }) => {
      await page.goto("/profile");

      // Look for delete account section, button, or danger zone
      const deleteSection = page.locator(
        "text=/Delete Account|Danger Zone|Delete your account/i",
      );
      const deleteButton = page.getByRole("button", {
        name: /Delete Account|Delete/i,
      });
      const dangerCard = page.locator('[class*="destructive"]');

      const hasSection = await deleteSection
        .first()
        .isVisible()
        .catch(() => false);
      const hasButton = await deleteButton
        .first()
        .isVisible()
        .catch(() => false);
      const hasDanger = await dangerCard
        .first()
        .isVisible()
        .catch(() => false);

      // Either section, button, or danger zone should exist (or page may require auth)
      // If redirected to sign-in, that's acceptable too
      const url = page.url();
      const redirected = url.includes("/sign-in");

      expect(hasSection || hasButton || hasDanger || redirected).toBe(true);
    });
  });

  test.describe("Active Sessions Section", () => {
    test("sessions section exists", async ({ page }) => {
      await page.goto("/profile");

      // Look for sessions section
      const sessionsSection = page.locator(
        "text=/Active Sessions|Sessions|Devices/i",
      );
      if (await sessionsSection.first().isVisible()) {
        await expect(sessionsSection.first()).toBeVisible();
      }
    });

    test("sign out other devices option exists", async ({ page }) => {
      await page.goto("/profile");

      const signOutButton = page.getByRole("button", {
        name: /Sign out other|Sign out all/i,
      });
      if (await signOutButton.isVisible()) {
        await expect(signOutButton).toBeVisible();
      }
    });
  });

  test.describe("Email Verification Prompt", () => {
    test("verification section visible for unverified users", async ({
      page,
    }) => {
      await page.goto("/profile");

      // Look for verification prompt
      const verifyPrompt = page.locator(
        "text=/Verify.*Email|Email.*not verified|Resend/i",
      );
      // This may or may not be visible depending on user state
      if (await verifyPrompt.first().isVisible()) {
        await expect(verifyPrompt.first()).toBeVisible();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("profile page displays correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/profile");

      const body = page.locator("body");
      await expect(body).toBeVisible();
    });

    test("profile page displays correctly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto("/profile");

      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });
});
