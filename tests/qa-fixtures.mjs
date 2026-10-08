import mongoose from "../backend/node_modules/mongoose/index.js";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { app } from "../backend/src/app.js";
import User from "../backend/src/modules/user/user.model.js";
import Store from "../backend/src/modules/store/store.model.js";
import Product from "../backend/src/modules/product/product.model.js";
import Category from "../backend/src/modules/category/category.model.js";
import Order from "../backend/src/modules/order/order.model.js";

export async function startQA(port = 0) {
  process.env.NODE_ENV = "test";
  process.env.CORS_ORIGIN = "http://127.0.0.1:5273,http://127.0.0.1:5274";
  process.env.ACCESS_TOKEN_SECRET =
    "qa-only-access-secret-that-is-never-for-production";
  process.env.REFRESH_TOKEN_SECRET =
    "qa-only-refresh-secret-that-is-never-for-production";
  process.env.ACCESS_TOKEN_VALIDITY = "1h";
  process.env.REFRESH_TOKEN_VALIDITY = "1d";
  const database = await MongoMemoryReplSet.create({
    instanceOpts: [{ args: ["--wiredTigerCacheSizeGB", "0.25"] }],
    replSet: { count: 1 },
    binary: { version: "7.0.14" },
  });
  let server;
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      if (server) {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeIdleConnections();
        });
      }
    } finally {
      try {
        await mongoose.disconnect();
      } finally {
        await database.stop();
      }
    }
  };
  try {
    await mongoose.connect(database.getUri());
    await Promise.all([
      Order.init(),
      Product.init(),
      Store.init(),
      User.init(),
      Category.init(),
    ]);
    const [store, otherStore] = await Store.create([
      {
        name: "ShopVista",
        slug: "shopvista",
        description: "Discover quality products for everyday living.",
        shippingFee: 60,
        supportEmail: "qa@example.test",
      },
      { name: "Other Store", slug: "other-store" },
    ]);
    const category = await Category.create({
      name: "Electronics",
      slug: "electronics",
      tenantId: store._id,
    });
    const product = await Product.create({
      name: "Studio Headphones",
      slug: "studio-headphones",
      price: 2500,
      stock: 20,
      discount: 10,
      tenantId: store._id,
      category: category._id,
      description: "Comfortable over-ear headphones with clear sound.",
    });
    const otherProduct = await Product.create({
      name: "Other Store Product",
      slug: "other-product",
      price: 500,
      stock: 5,
      tenantId: otherStore._id,
    });
    const owner = await User.create({
      username: "qa-owner",
      email: "owner@example.test",
      password: "QA-password-2026",
      role: "SUPER_ADMIN",
    });
    const admin = await User.create({
      username: "qa-admin",
      email: "admin@example.test",
      password: "QA-password-2026",
      role: "ADMIN",
      tenantId: store._id,
    });
    const otherAdmin = await User.create({
      username: "qa-other",
      email: "other@example.test",
      password: "QA-password-2026",
      role: "ADMIN",
      tenantId: otherStore._id,
    });
    const customer = await User.create({
      username: "qa-customer",
      email: "customer@example.test",
      password: "QA-password-2026",
      role: "user",
    });
    server = await new Promise((resolve, reject) => {
      const instance = app.listen(port, "127.0.0.1", (error) => {
        if (error) {
          reject(error);
          return;
        }
        instance.removeListener("error", reject);
        resolve(instance);
      });
      instance.once("error", reject);
    });
    return {
      base: `http://127.0.0.1:${server.address().port}/api/v1`,
      store,
      otherStore,
      product,
      otherProduct,
      owner,
      admin,
      otherAdmin,
      customer,
      stop,
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
