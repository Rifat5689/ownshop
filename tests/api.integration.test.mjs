import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startQA } from "./qa-fixtures.mjs";
import Product from "../backend/src/modules/product/product.model.js";
import User from "../backend/src/modules/user/user.model.js";
let qa;
before(
  async () => {
    qa = await startQA();
  },
  { timeout: 900000 },
);
after(async () => {
  if (qa) await qa.stop();
});
async function call(path, { method = "GET", data, user, headers = {} } = {}) {
  const response = await fetch(`${qa.base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(user
        ? { Authorization: `Bearer ${user.generateAccessToken()}` }
        : {}),
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return {
    status: response.status,
    body: await response.json(),
    headers: response.headers,
  };
}
const shippingDetails = {
  name: "QA Buyer",
  phone: "01712345678",
  address: "QA Street, Dhaka",
};
test("backend boots and returns readiness", async () => {
  assert.equal((await call("/health")).status, 200);
});
test("product image uploads enforce authentication, file validation and storage configuration", async () => {
  assert.equal(
    (await call("/products/images", { method: "POST", data: {} })).status,
    401,
  );
  assert.equal(
    (
      await call("/products/images", {
        method: "POST",
        user: qa.admin,
        data: {},
      })
    ).status,
    400,
  );
  const upload = async (bytes, type) => {
    const body = new FormData();
    body.append("images", new Blob([bytes], { type }), "photo.png");
    return fetch(`${qa.base}/products/images`, {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${qa.admin.generateAccessToken()}` },
    });
  };
  assert.equal((await upload("not an image", "image/png")).status, 400);
  assert.equal(
    (await upload("<script>alert(1)</script>", "image/svg+xml")).status,
    400,
  );
  const prior = process.env.CLOUD_STORAGE_ACCOUNT_ID;
  delete process.env.CLOUD_STORAGE_ACCOUNT_ID;
  try {
    assert.equal(
      (
        await upload(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
          "image/png",
        )
      ).status,
      503,
    );
  } finally {
    if (prior !== undefined) process.env.CLOUD_STORAGE_ACCOUNT_ID = prior;
  }
});
test("anonymous users cannot create stores, products, categories or list orders", async () => {
  for (const path of ["/stores", "/products", "/categories"])
    assert.equal((await call(path, { method: "POST", data: {} })).status, 401);
  assert.equal((await call("/orders")).status, 401);
});
test("store administrator cannot perform platform operations", async () => {
  for (const path of ["/stores", "/users/admins", "/platform/settings"])
    assert.equal((await call(path, { user: qa.admin })).status, 403);
});
test("customers cannot perform store administration", async () => {
  assert.equal((await call("/products", { user: qa.customer })).status, 403);
});
test("authentication returns a usable token and no password", async () => {
  const result = await call("/users/auth/login", {
    method: "POST",
    data: { username: "qa-owner", password: "QA-password-2026" },
  });
  assert.equal(result.status, 200);
  assert.ok(result.body.data.accessToken);
  assert.equal(result.body.data.user.password, undefined);
  const session = await call("/users/me", {
    headers: { Authorization: `Bearer ${result.body.data.accessToken}` },
  });
  assert.equal(session.body.data.role, "SUPER_ADMIN");
});
test("public catalog contains only the requested tenant", async () => {
  const result = await call("/products/store/shopvista");
  assert.equal(result.status, 200);
  assert.ok(
    result.body.data.every(
      (product) => product.tenantId === String(qa.store._id),
    ),
  );
  assert.equal(
    (await call("/products/store/shopvista/other-product")).status,
    404,
  );
});
test("store administrator reads only assigned inventory despite a forged tenant", async () => {
  const result = await call(`/products?tenantId=${qa.otherStore._id}`, {
    user: qa.admin,
  });
  assert.equal(result.body.data.length, 1);
  assert.equal(result.body.data[0]._id, String(qa.product._id));
});
test("cross-tenant product writes are rejected", async () => {
  assert.equal(
    (
      await call(`/products/${qa.otherProduct._id}`, {
        method: "PATCH",
        user: qa.admin,
        data: { tenantId: qa.otherStore._id, price: 1 },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await call(`/products/${qa.otherProduct._id}`, {
        method: "DELETE",
        user: qa.admin,
      })
    ).status,
    404,
  );
});
test("catalog product CRUD validates stock and prices", async () => {
  const invalid = await call("/products", {
    method: "POST",
    user: qa.admin,
    data: { name: "Bad", price: -1 },
  });
  assert.equal(invalid.status, 400);
  const result = await call("/products", {
    method: "POST",
    user: qa.admin,
    data: { name: "QA Product", price: 100, stock: 2 },
  });
  assert.equal(result.status, 201);
  const id = result.body.data._id;
  assert.equal(
    (
      await call(`/products/${id}`, {
        method: "PATCH",
        user: qa.admin,
        data: { stock: 1.5 },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call(`/products/${id}`, {
        method: "PATCH",
        user: qa.admin,
        data: { price: 120 },
      })
    ).status,
    200,
  );
  assert.equal(
    (await call(`/products/${id}`, { method: "DELETE", user: qa.admin }))
      .status,
    200,
  );
});
test("checkout rejects client payment methods and cross-tenant items", async () => {
  const data = {
    orderItems: [{ productId: String(qa.otherProduct._id), quantity: 1 }],
    shippingDetails,
  };
  assert.equal(
    (
      await call("/orders/store/shopvista", {
        method: "POST",
        data,
        headers: { "Idempotency-Key": randomUUID() },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call("/orders/store/shopvista", {
        method: "POST",
        data: { ...data, paymentMethod: "bkash" },
        headers: { "Idempotency-Key": randomUUID() },
      })
    ).status,
    400,
  );
});
test("checkout computes totals, prevents duplicate orders, isolates reads and enforces status transitions", async () => {
  const key = randomUUID();
  const data = {
    orderItems: [{ productId: String(qa.product._id), quantity: 2 }],
    shippingDetails,
    totalPrice: 1,
  };
  const options = { method: "POST", data, headers: { "Idempotency-Key": key } };
  const created = await call("/orders/store/shopvista", options);
  assert.equal(created.status, 201);
  assert.equal(created.body.data.totalPrice, 4560);
  const order = created.body.data;
  assert.equal((await Product.findById(qa.product._id)).stock, 18);
  const repeated = await call("/orders/store/shopvista", options);
  assert.equal(repeated.body.data._id, order._id);
  assert.equal((await Product.findById(qa.product._id)).stock, 18);
  assert.equal(
    (
      await call("/orders/store/shopvista", {
        ...options,
        data: {
          ...data,
          shippingDetails: { ...shippingDetails, name: "Different" },
        },
      })
    ).status,
    409,
  );
  assert.equal(
    (await call(`/orders/store/shopvista/${order._id}`)).status,
    401,
  );
  assert.equal(
    (
      await call(`/orders/store/shopvista/${order._id}`, {
        headers: { "X-Tracking-Token": order.trackingToken },
      })
    ).status,
    200,
  );
  assert.equal(
    (await call(`/orders/${order._id}`, { user: qa.otherAdmin })).status,
    404,
  );
  assert.equal(
    (
      await call(`/orders/${order._id}`, {
        method: "PATCH",
        user: qa.admin,
        data: { status: "delivered" },
      })
    ).status,
    400,
  );
  for (const status of ["confirmed", "processing", "shipped", "delivered"])
    assert.equal(
      (
        await call(`/orders/${order._id}`, {
          method: "PATCH",
          user: qa.admin,
          data: { status },
        })
      ).status,
      200,
    );
  const summary = await call("/platform/summary", { user: qa.admin });
  assert.equal(summary.body.data.totalRevenue, 4560);
  const returned = await call(`/orders/${order._id}`, {
    method: "PATCH",
    user: qa.admin,
    data: { status: "returned" },
  });
  assert.equal(returned.status, 200);
  assert.equal((await Product.findById(qa.product._id)).stock, 20);
});
test("stock depletion is atomic under concurrent checkouts", async () => {
  const product = await Product.create({
    name: "Last One",
    slug: "last-one",
    tenantId: qa.store._id,
    price: 100,
    stock: 1,
  });
  const results = await Promise.all(
    [1, 2].map(() =>
      call("/orders/store/shopvista", {
        method: "POST",
        data: {
          orderItems: [{ productId: String(product._id), quantity: 1 }],
          shippingDetails,
        },
        headers: { "Idempotency-Key": randomUUID() },
      }),
    ),
  );
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
  assert.equal((await Product.findById(product._id)).stock, 0);
});
test("disabled store and account stop access", async () => {
  const store = await call(`/stores/${qa.otherStore._id}`, {
    method: "PATCH",
    user: qa.owner,
    data: { status: "SUSPENDED" },
  });
  assert.equal(store.status, 200);
  assert.equal((await call("/products/store/other-store")).status, 404);
  assert.equal((await call("/products", { user: qa.otherAdmin })).status, 403);
  await User.findByIdAndUpdate(qa.otherAdmin._id, { isActive: false });
  assert.equal((await call("/users/me", { user: qa.otherAdmin })).status, 401);
});
test("CORS origins are matched exactly", async () => {
  process.env.CORS_ORIGIN = "https://allowed.example";
  assert.equal(
    (await call("/health", { headers: { Origin: "https://allowed.example" } }))
      .status,
    200,
  );
  assert.equal(
    (await call("/health", { headers: { Origin: "https://allowed.exam" } }))
      .status,
    403,
  );
});
test("platform and store sessions use separate cookies, and bearer tokens take priority", async () => {
  const platform = await call("/users/auth/login", {
    method: "POST",
    data: { username: "qa-owner", password: "QA-password-2026" },
    headers: { "X-App-Client": "super-admin" },
  });
  const merchant = await call("/users/auth/login", {
    method: "POST",
    data: { username: "qa-admin", password: "QA-password-2026" },
    headers: { "X-App-Client": "store-admin" },
  });
  const platformCookies = platform.headers.getSetCookie();
  const merchantCookies = merchant.headers.getSetCookie();
  assert.ok(
    platformCookies.some((cookie) => cookie.startsWith("platformAccessToken=")),
  );
  assert.ok(
    merchantCookies.some((cookie) => cookie.startsWith("storeAccessToken=")),
  );
  const cookies = merchantCookies
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
  const session = await call("/users/me", {
    headers: {
      Cookie: cookies,
      Authorization: `Bearer ${platform.body.data.accessToken}`,
    },
  });
  assert.equal(session.body.data.role, "SUPER_ADMIN");
  const refresh = platformCookies
    .find((cookie) => cookie.startsWith("platformRefreshToken="))
    .split(";")[0];
  const rotated = await call("/users/auth/refreshtoken", {
    method: "POST",
    headers: { Cookie: refresh, "X-App-Client": "super-admin" },
  });
  assert.equal(rotated.status, 200);
  const replay = await call("/users/auth/refreshtoken", {
    method: "POST",
    headers: { Cookie: refresh, "X-App-Client": "super-admin" },
  });
  assert.equal(replay.status, 401);
});
