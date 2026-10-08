import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;
const collections = ["categories", "products", "orders", "users"];
const objectId = (value) => {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value))
    throw new Error("Mappings require 24-character ObjectId strings");
  return new ObjectId(value);
};

// Use raw collections so migration never rewrites unrelated legacy fields.
export async function migrateTenants(connection, plan, { apply = false } = {}) {
  if (!Array.isArray(plan?.assignments) || !plan.assignments.length)
    throw new Error("Provide a nonempty assignments array");
  const entries = new Map();
  for (const entry of plan.assignments) {
    if (!collections.includes(entry.collection))
      throw new Error("Unsupported migration collection");
    const normalized = {
      collection: entry.collection,
      _id: objectId(entry.id),
      tenantId: objectId(entry.tenantId),
    };
    const key = `${entry.collection}:${normalized._id}`;
    if (entries.has(key)) throw new Error("Duplicate record assignment");
    entries.set(key, normalized);
  }
  const session = await connection.startSession();
  try {
    return await session.withTransaction(
      async () => {
        const records = new Map();
        for (const [key, entry] of entries) {
          const store = await connection
            .collection("stores")
            .findOne({ _id: entry.tenantId }, { session });
          if (!store) throw new Error(`Store does not exist for ${key}`);
          const record = await connection
            .collection(entry.collection)
            .findOne({ _id: entry._id }, { session });
          if (!record) throw new Error(`Record does not exist: ${key}`);
          if (
            record.tenantId != null &&
            String(record.tenantId) !== String(entry.tenantId)
          )
            throw new Error(`Refusing to reassign an existing tenant: ${key}`);
          if (
            entry.collection === "users" &&
            !["admin", "ADMIN"].includes(record.role)
          )
            throw new Error(
              `Only legacy or store administrators may be migrated: ${key}`,
            );
          records.set(key, record);
        }
        const checkReference = async (collection, id, tenantId) => {
          const referenceId = objectId(String(id));
          const reference = await connection
            .collection(collection)
            .findOne({ _id: referenceId }, { session });
          const mapped = entries.get(`${collection}:${referenceId}`);
          const assigned = mapped?.tenantId ?? reference?.tenantId;
          if (!reference || String(assigned) !== String(tenantId))
            throw new Error(
              `Unresolved or cross-tenant ${collection} reference`,
            );
        };
        const categoryKeys = new Set();
        for (const [key, entry] of entries) {
          const record = records.get(key);
          if (entry.collection === "categories") {
            if (typeof record.slug !== "string" || !record.slug.trim())
              throw new Error(`Category requires a valid slug: ${key}`);
            const slugKey = `${entry.tenantId}:${record.slug}`;
            if (categoryKeys.has(slugKey))
              throw new Error("Duplicate category slug in mapping");
            categoryKeys.add(slugKey);
            const conflict = await connection.collection("categories").findOne(
              {
                _id: { $ne: entry._id },
                tenantId: entry.tenantId,
                slug: record.slug,
              },
              { session },
            );
            if (conflict)
              throw new Error(`Category slug already exists: ${key}`);
          }
          if (entry.collection === "products" && record.category != null)
            await checkReference("categories", record.category, entry.tenantId);
          if (entry.collection === "orders") {
            if (!Array.isArray(record.orderItems) || !record.orderItems.length)
              throw new Error(`Order requires manual schema review: ${key}`);
            for (const item of record.orderItems)
              await checkReference("products", item.productId, entry.tenantId);
          }
        }
        const result = {
          mode: apply ? "apply" : "dry-run",
          assigned: 0,
          unchanged: 0,
        };
        for (const [key, entry] of entries) {
          const record = records.get(key);
          const alreadyAssigned = record.tenantId != null;
          const roleChange =
            entry.collection === "users" && record.role === "admin";
          if (alreadyAssigned && !roleChange) {
            result.unchanged++;
            continue;
          }
          if (apply) {
            const filter = {
              _id: entry._id,
              tenantId: alreadyAssigned ? entry.tenantId : null,
            };
            const values = { tenantId: entry.tenantId };
            if (entry.collection === "users") {
              filter.role = record.role;
              values.role = "ADMIN";
              values.refreshToken = null;
            }
            const updated = await connection
              .collection(entry.collection)
              .updateOne(filter, { $set: values }, { session });
            if (updated.matchedCount !== 1)
              throw new Error(`Record changed during migration: ${key}`);
          }
          result.assigned++;
        }
        return result;
      },
      { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } },
    );
  } finally {
    await session.endSession();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name) => args[args.indexOf(name) + 1];
  if (!args.includes("--plan") || !option("--plan"))
    throw new Error(
      "Usage: --plan mapping.json [--apply --backup-ref ID --plan-sha256 HASH]",
    );
  const bytes = await readFile(option("--plan"));
  const hash = createHash("sha256").update(bytes).digest("hex");
  const apply = args.includes("--apply");
  if (
    apply &&
    (!args.includes("--backup-ref") ||
      !option("--backup-ref") ||
      option("--backup-ref").startsWith("--") ||
      !args.includes("--plan-sha256") ||
      option("--plan-sha256") !== hash)
  )
    throw new Error(
      "Apply requires a backup reference and the reviewed dry-run plan hash",
    );
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: false,
    });
    const result = await migrateTenants(
      mongoose.connection,
      JSON.parse(bytes),
      { apply },
    );
    console.log(JSON.stringify({ ...result, planSha256: hash }));
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => {
    console.error(
      "Tenant migration did not complete successfully. Review the plan, references, backup and database configuration; verify database state before retrying.",
    );
    process.exitCode = 1;
  });
