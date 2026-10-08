import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/modules/user/user.model.js";

const { OWNER_EMAIL, OWNER_PASSWORD, MONGODB_URI } = process.env;
if (!OWNER_EMAIL || !/^\d{6}$/.test(OWNER_PASSWORD || "") || !MONGODB_URI)
  throw new Error("Set OWNER_EMAIL, OWNER_PASSWORD (exactly six digits), and MONGODB_URI locally.");
await mongoose.connect(MONGODB_URI, { autoIndex: false, serverSelectionTimeoutMS: 10000 });
try {
  const owner = await User.findOne({ email: OWNER_EMAIL.toLowerCase(), role: "SUPER_ADMIN" });
  if (!owner) throw new Error("Platform owner not found");
  if (process.argv.includes("--apply")) {
    owner.password = OWNER_PASSWORD;
    owner.refreshToken = null;
    await owner.save();
    console.log("Owner password updated and refresh session revoked. Credentials were not printed.");
  } else console.log("Owner found. Run with --apply to update its password.");
} finally {
  await mongoose.disconnect();
}
