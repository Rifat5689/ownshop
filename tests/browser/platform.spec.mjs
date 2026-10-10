import { test, expect } from "@playwright/test";
const shop = "http://127.0.0.1:5273";
const owner = "http://127.0.0.1:5274";
async function login(page, platform = false) {
  await page.goto(platform ? `${owner}/login` : `${shop}/shopvista/admin`);
  await page
    .getByLabel("Email or Username")
    .fill(platform ? "qa-owner" : "qa-admin");
  await page.getByLabel("Password", { exact: true }).fill("482913");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
}
async function nav(page, to) {
  if (await page.getByRole("button", { name: "Open menu" }).isVisible())
    await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator(`aside a[href="${to}"]`).click();
}
test("root is not found and catalog, search, category, sorting and details work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(shop);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.goto(`${shop}/shopvista`);
  await page
    .locator(".ob-hero article.active, .shop-hero")
    .getByRole("link", { name: /^(Shop Now|Shop the collection)( →)?$/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "All Products", exact: true }),
  ).toBeVisible();
  await page.locator(".filters input").fill("no-such-product");
  await expect(
    page.getByRole("heading", { name: "No results found" }),
  ).toBeVisible();
  await page.locator(".filters input").fill("Studio");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("electronics");
  await page
    .getByRole("combobox", { name: "Sort by", exact: true })
    .selectOption("price-low");
  await page.getByRole("heading", { name: "Studio Headphones" }).click();
  await expect(page).toHaveTitle("Studio Headphones | ShopVista");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Studio Headphones | ShopVista",
  );
  await expect(
    page.getByRole("heading", { name: "Studio Headphones" }),
  ).toBeVisible();
  const quantity = page.locator(
    '.product-detail input[type="number"], .ob-purchase-row select',
  );
  if ((await quantity.evaluate((element) => element.tagName)) === "SELECT") {
    await quantity.selectOption("2");
  } else {
    await quantity.fill("2");
  }
  await page.getByRole("button", { name: /^Add to cart$/i }).click();
  await expect(page.getByRole("status")).toContainText("added to your cart");
  expect(errors).toEqual([]);
});
test("cart quantities persist and are isolated across stores", async ({
  page,
}) => {
  await page.goto(`${shop}/shopvista/products/studio-headphones`);
  await page.getByRole("button", { name: /^Add to cart$/i }).click();
  await page.goto(`${shop}/shopvista/cart`);
  await expect(
    page.getByRole("heading", { name: "Your Cart (1)" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Increase Studio Headphones quantity" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your Cart (2)" }),
  ).toBeVisible();
  await page.goto(`${shop}/other-store/cart`);
  await expect(
    page.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeVisible();
  await page.goto(`${shop}/shopvista/cart`);
  await expect(
    page.getByRole("heading", { name: "Your Cart (2)" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Studio Headphones", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeVisible();
});
test("wishlist persists and can remove an item", async ({ page }) => {
  await page.goto(`${shop}/shopvista/products/studio-headphones`);
  await page
    .getByRole("button", { name: "Add to Wishlist", exact: false })
    .click();
  await page.goto(`${shop}/shopvista/wishlist`);
  await expect(
    page.getByRole("heading", { name: "Studio Headphones" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove from wishlist", exact: true })
    .click();
  await expect(page.getByText("Your wishlist is empty.")).toBeVisible();
});
test("checkout submits a real order and tracking opens", async ({ page }) => {
  await page.goto(`${shop}/shopvista/products/studio-headphones`);
  await page.getByRole("button", { name: "Buy Now" }).click();
  await page.getByLabel("Full Name").fill("Browser QA Buyer");
  await page.getByLabel("Phone Number").fill("01712345678");
  await page.getByLabel("Delivery Address").fill("QA Street, Dhaka");
  await page.getByRole("button", { name: "Place Order", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Thank you for your order!" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Track Order", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "pending", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("QA Street, Dhaka", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "pending", exact: true }),
  ).toBeVisible();
});
test("spoofed local storage does not grant super-admin access", async ({
  page,
}) => {
  await page.goto(`${owner}/login`);
  await page.evaluate(() =>
    localStorage.setItem("admin_auth", JSON.stringify({ role: "SUPER_ADMIN" })),
  );
  await page.goto(`${owner}/stores`);
  await expect(page).toHaveURL(`${owner}/login`);
});
test("merchant authentication, real dashboard and logout work", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByText("Total Products", { exact: true })).toBeVisible();
  await nav(page, "/shopvista/admin/settings");
  await expect(page.getByLabel("Store Name")).toHaveValue("ShopVista");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();
  if (await page.getByRole("button", { name: "Open menu" }).isVisible())
    await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Logout", exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "Merchant Login" }),
  ).toBeVisible();
  await page.goto(`${shop}/shopvista/admin/orders`);
  await expect(
    page.getByRole("heading", { name: "Merchant Login" }),
  ).toBeVisible();
});
test("merchant product create edit and delete work", async ({ page }) => {
  await login(page);
  await page.goto(`${shop}/shopvista/admin/products/create`);
  const name = `Browser Product ${Date.now()}`;
  await page.getByLabel("Product Name").fill(name);
  await page.getByLabel("Price (BDT)").fill("100");
  await page.getByLabel("Stock", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Save Product" }).click();
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
  await page.getByRole("link", { name: `Edit ${name}` }).click();
  await page.getByLabel("Price (BDT)").fill("150");
  await page.getByRole("button", { name: "Save Product" }).click();
  const row = page.getByRole("row").filter({ hasText: name });
  await expect(row).toContainText("150.00");
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("cell", { name, exact: true })).toHaveCount(0);
});
test("category CRUD and customer details are functional", async ({ page }) => {
  await login(page);
  await nav(page, "/shopvista/admin/categories");
  const name = `QA Category ${Date.now()}`;
  await page.getByLabel("Category Name").fill(name);
  await page.getByRole("button", { name: "Create Category" }).click();
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Category Name").fill(`${name} Updated`);
  await page.getByRole("button", { name: "Update Category" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("row")
    .filter({ hasText: `${name} Updated` })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(
    page.getByRole("cell", { name: `${name} Updated`, exact: true }),
  ).toHaveCount(0);
  await nav(page, "/shopvista/admin/customers");
  const details = page.getByRole("link", { name: "View Details" }).first();
  if (await details.isVisible()) {
    await details.click();
    await expect(page.getByText("Phone: 01712345678")).toBeVisible();
  } else {
    const customer = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "01712345678" }) });
    await expect(customer).toContainText("Browser QA Buyer");
    await expect(customer).toContainText("QA Street, Dhaka");
  }
});
test("store owner can create a store and disable/reactivate it", async ({
  page,
}) => {
  await login(page, true);
  await page.goto(`${owner}/stores/create`);
  const slug = `qa-shop-${Date.now()}`;
  await page.getByLabel("Store Name").fill(slug);
  await page.getByLabel("Store Slug").fill(slug);
  await page.getByRole("button", { name: "Save Store" }).click();
  const row = page.getByRole("row").filter({ hasText: slug });
  await expect(row).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Disable", exact: true }).click();
  await expect(row).toContainText("INACTIVE");
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Activate", exact: true }).click();
  await expect(row).toContainText("ACTIVE");
  await row.getByRole("link", { name: "Edit", exact: true }).click();
  await page.getByLabel("Description").fill("Updated description");
  await page.getByRole("button", { name: "Save Store" }).click();
  await row.getByRole("link", { name: slug, exact: true }).click();
  await expect(
    page.getByText("Updated description", { exact: true }),
  ).toBeVisible();
});
test("owner creates an assigned admin, edits subscription and saves settings", async ({
  page,
}) => {
  await login(page, true);
  await page.goto(`${owner}/admins/create`);
  const username = `qa-browser-${Date.now()}`;
  await page.getByLabel("Name", { exact: true }).fill(username);
  await page
    .getByLabel("Email", { exact: true })
    .fill(`${username}@example.test`);
  await page
    .getByRole("combobox", { name: "Assigned Store", exact: true })
    .selectOption({ label: "ShopVista" });
  await page.getByLabel("Password", { exact: true }).fill("593024");
  await page.getByRole("button", { name: "Save Administrator" }).click();
  await expect(
    page.getByRole("link", { name: username, exact: true }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  const row = page.getByRole("row").filter({ hasText: username });
  await row.getByRole("button", { name: "Disable", exact: true }).click();
  await expect(row).toContainText("Disabled");
  await nav(page, "/subscriptions");
  await page
    .getByRole("row")
    .filter({ hasText: "ShopVista" })
    .getByRole("button", { name: "Edit Subscription" })
    .click();
  await page
    .getByRole("combobox", { name: "Plan", exact: true })
    .selectOption("Premium");
  await page.getByLabel("Renewal Date").fill("2026-12-31");
  await page.getByRole("button", { name: "Save Subscription" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "ShopVista" }),
  ).toContainText("Premium");
  await nav(page, "/settings");
  await page.getByLabel("Platform Name").fill("OwnShop QA");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();
});
test("mobile and desktop pages fit the viewport and generate screenshots", async ({
  page,
}, testInfo) => {
  for (const route of [
    "/shopvista",
    "/shopvista/products",
    "/shopvista/products/studio-headphones",
    "/shopvista/cart",
    "/shopvista/categories",
    "/shopvista/account",
  ]) {
    await page.goto(`${shop}${route}`);
    await expect(page.locator("main > *").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goto(`${shop}/shopvista`);
  await page.screenshot({
    path: testInfo.outputPath("storefront.png"),
    fullPage: true,
  });
  await login(page, true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("super-admin.png"),
    fullPage: true,
  });
});
