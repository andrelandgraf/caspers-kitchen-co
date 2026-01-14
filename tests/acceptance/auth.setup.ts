import { test as setup } from "@playwright/test";

// Test user credentials - fixed email for consistent sessions
const TEST_USER = {
  firstName: "Test",
  lastName: "User",
  email: "e2e-test@example.com",
  password: "TestPassword123!",
};

// File to store authenticated session
export const STORAGE_STATE_PATH = "tests/.auth/user.json";

setup("create and authenticate test user", async ({ page }) => {
  // First try to sign in (user may already exist from previous runs)
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait to see if sign in succeeds
  const signInSuccess = await page
    .waitForURL(/\/(menu|$)/, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (!signInSuccess) {
    // User doesn't exist, create a new account
    await page.goto("/sign-up");

    // Fill out sign up form using exact field labels
    await page.getByLabel("First name").fill(TEST_USER.firstName);
    await page.getByLabel("Last name").fill(TEST_USER.lastName);
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password", { exact: true }).fill(TEST_USER.password);
    await page.getByLabel("Confirm password").fill(TEST_USER.password);

    // Submit form
    await page.getByRole("button", { name: /create account/i }).click();

    // Wait for redirect to menu
    await page.waitForURL(/\/(menu|$)/, { timeout: 15000 });
  }

  // Verify we're authenticated by navigating to home
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Save the authenticated state
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
