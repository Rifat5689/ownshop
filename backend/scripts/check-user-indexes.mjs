import "dotenv/config";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
if (apply && !process.argv.includes("--backup-confirmed"))
  throw new Error("Verify a restorable backup first, then supply --backup-confirmed.");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  });
  const users = mongoose.connection.collection("users");
  const indexes = await users.indexes();
  console.log(`Database: ${mongoose.connection.name}`);
  const index = indexes.find((entry) => entry.name === "mobilenumber_1");
  if (!index) {
    console.log("No legacy mobilenumber_1 index remains. No changes made.");
  } else if (
    Object.keys(index.key).length !== 1 ||
    index.key.mobilenumber !== 1 ||
    index.unique !== true
  ) {
    throw new Error("Index differs from the reported legacy index. Review it manually.");
  } else {
    console.log("Legacy unique mobilenumber_1 index found. Current User model does not use this field.");
    if (apply) {
      await users.dropIndex("mobilenumber_1");
      console.log("Removed only mobilenumber_1. User records and other indexes were preserved.");
    } else {
      console.log("Read-only check. After backup and confirming the database, run with --apply --backup-confirmed to remove this obsolete index.");
    }
  }
} catch {
  console.error("Index check/repair failed. Verify database access and review the index; credentials were not printed.");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
