import { defineConfig, devices } from "@playwright/test";

// Path to store authenticated user session
const STORAGE_STATE_PATH = "tests/.auth/user.json";

export default defineConfig({
  testDir: "./tests/acceptance",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3, // Reduced from default to avoid overwhelming Neon DB
  reporter: "html",
  timeout: 90000, // 90s to accommodate slow Neon DB cold starts and concurrent queries
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 90000,
  },
  projects: [
    // Setup project - creates and authenticates a test user
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Default project - runs without authentication
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/auth\.setup\.ts/, /\.auth\.spec\.ts/],
    },
    // Authenticated tests - runs with saved auth state
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ["setup"],
      testMatch: /\.auth\.spec\.ts/, // Only run files matching *.auth.spec.ts
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
