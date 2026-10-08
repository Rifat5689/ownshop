import { test } from "node:test";
import assert from "node:assert/strict";
import { S3Client } from "../backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";
import { uploadProductImage } from "../backend/src/services/product-images.service.js";

test("R2 uploads preserve tenant keys and map provider failures to 503", async (context) => {
  const settings = {
    CLOUD_STORAGE_ACCOUNT_ID: "a".repeat(32),
    CLOUD_STORAGE_ACCESS_KEY: "test-only-key",
    CLOUD_STORAGE_SECRET_KEY: "test-only-secret",
    CLOUD_STORAGE_BUCKET: "test-images",
    CLOUD_STORAGE_PUBLIC_URL: "https://images.example.test/",
  };
  const prior = Object.fromEntries(
    Object.keys(settings).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, settings);
  const file = {
    mimetype: "image/png",
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  };
  let fail = false;
  context.mock.method(S3Client.prototype, "send", async (command, options) => {
    assert.equal(command.input.Bucket, "test-images");
    assert.match(command.input.Key, /^stores\/tenant-test\/products\/.+\.png$/);
    assert.equal(command.input.ContentType, "image/png");
    assert.ok(options.abortSignal instanceof AbortSignal);
    if (fail) throw new Error("provider-secret-error");
    return {};
  });
  try {
    const uploaded = await uploadProductImage(file, "tenant-test");
    assert.equal(
      uploaded.url,
      `https://images.example.test/${uploaded.public_id}`,
    );
    fail = true;
    await assert.rejects(
      uploadProductImage(file, "tenant-test"),
      (error) =>
        error.statusCode === 503 && !error.message.includes("provider-secret"),
    );
    for (const invalid of [
      "not-a-url",
      "http://images.example.test",
      "https://user:password@images.example.test",
      "https://images.example.test/?query=1",
    ]) {
      process.env.CLOUD_STORAGE_PUBLIC_URL = invalid;
      await assert.rejects(
        uploadProductImage(file, "tenant-test"),
        (error) => error.statusCode === 503,
      );
    }
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
