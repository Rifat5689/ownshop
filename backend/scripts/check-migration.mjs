import "dotenv/config";
import mongoose from "mongoose";
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  autoIndex: false,
});
try {
  for (const collection of ["products", "categories", "orders"]) {
    const count = await mongoose.connection
      .collection(collection)
      .countDocuments({
        $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
      });
    console.log(
      `${collection}: ${count} records need an explicit store assignment.`,
    );
  }
  const legacyAdmins = await mongoose.connection
    .collection("users")
    .countDocuments({ role: "admin" });
  console.log(
    `users: ${legacyAdmins} legacy administrators need explicit role/store migration.`,
  );
  console.log("Read-only audit complete. No records were modified.");
} finally {
  await mongoose.disconnect();
}
