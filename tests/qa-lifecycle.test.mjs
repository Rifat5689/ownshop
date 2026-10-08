import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import mongoose from "../backend/node_modules/mongoose/index.js";
import { startQA } from "./qa-fixtures.mjs";

test(
  "failed QA startup cleans up MongoDB and supports a fresh start",
  { timeout: 60000 },
  async () => {
    const occupied = createServer();
    occupied.listen(0, "127.0.0.1");
    await once(occupied, "listening");
    try {
      await assert.rejects(startQA(occupied.address().port), {
        code: "EADDRINUSE",
      });
      assert.equal(mongoose.connection.readyState, 0);
      const qa = await startQA();
      try {
        assert.equal((await fetch(`${qa.base}/health`)).status, 200);
      } finally {
        await qa.stop();
        await qa.stop();
      }
      assert.equal(mongoose.connection.readyState, 0);
    } finally {
      await new Promise((resolve) => occupied.close(resolve));
    }
  },
);
