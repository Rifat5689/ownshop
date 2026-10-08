import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  expect: { timeout: 15000 },
  testDir: "./tests/browser",
  timeout: 45000,
  workers: 1,
  fullyParallel: false,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "artifacts/e2e-results.json" }],
  ],
  use: {
    channel: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node tests/qa-server.mjs",
      url: "http://127.0.0.1:5001/api/v1/health",
      timeout: 900000,
      reuseExistingServer: process.env.QA_REUSE_API === "1",
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5273 --strictPort",
      cwd: "./ecommerce",
      url: "http://127.0.0.1:5273",
      env: { VITE_API_URL: "http://127.0.0.1:5001/api/v1" },
      timeout: 60000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5274 --strictPort",
      cwd: "./super-admin",
      url: "http://127.0.0.1:5274",
      env: {
        VITE_API_URL: "http://127.0.0.1:5001/api/v1",
        VITE_STOREFRONT_URL: "http://127.0.0.1:5273",
      },
      timeout: 60000,
      reuseExistingServer: false,
    },
  ],
});
