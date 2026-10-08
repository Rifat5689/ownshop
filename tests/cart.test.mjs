import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addCartItem,
  priceOf,
} from "../ecommerce/src/features/cart/utils/cartStorage.js";
test("cart respects stock caps and merges quantities", () => {
  const product = { _id: "one", price: 10.99, discount: 10, stock: 3 };
  assert.equal(
    addCartItem(addCartItem([], product, 2), product, 2)[0].quantity,
    3,
  );
  assert.deepEqual(addCartItem([], { ...product, stock: 0 }), []);
  assert.deepEqual(addCartItem([], product, 1.5), []);
  assert.equal(priceOf(product), 9.89);
});
