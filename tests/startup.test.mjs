import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";

test(
  "startup exposes 503 readiness while MongoDB is unavailable and exits without leaking credentials",
  { timeout: 20000 },
  async () => {
    const reservation = createServer();
    reservation.listen(0, "127.0.0.1");
    await once(reservation, "listening");
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    const child = spawn(process.execPath, ["backend/server.js"], {
      env: {
        ...process.env,
        NODE_ENV: "test",
        PORT: String(port),
        MONGODB_URI:
          "mongodb://secret-user:secret-password@127.0.0.1:1/test?directConnection=true",
        ACCESS_TOKEN_SECRET: "startup-test-access-secret",
        REFRESH_TOKEN_SECRET: "startup-test-refresh-secret",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const exited = once(child, "exit");
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    try {
      let response;
      for (let attempt = 0; attempt < 40; attempt++) {
        try {
          response = await fetch(`http://127.0.0.1:${port}/api/v1/health`, {
            signal: AbortSignal.timeout(500),
          });
          break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      assert.ok(
        response,
        "HTTP port must open before database connection completes",
      );
      assert.equal(response.status, 503);
      assert.equal((await response.json()).data.database, "unavailable");
      const catalog = await fetch(
        `http://127.0.0.1:${port}/api/v1/products/store/shopvista`,
      );
      assert.equal(catalog.status, 503);
      assert.equal((await exited)[0], 1);
      assert.ok(output.includes("MongoDB connection failed"));
      assert.ok(!output.includes("secret-user"));
      assert.ok(!output.includes("secret-password"));
    } finally {
      if (child.exitCode === null) child.kill();
    }
  },
);
