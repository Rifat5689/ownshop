import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/modules/user/user.model.js";
const { OWNER_USERNAME, OWNER_EMAIL, OWNER_PASSWORD, MONGODB_URI } =
  process.env;
if (
  !OWNER_USERNAME ||
  !OWNER_EMAIL ||
  !OWNER_PASSWORD ||
  OWNER_PASSWORD.length < 12 ||
  !MONGODB_URI
)
  throw new Error(
    "Set OWNER_USERNAME, OWNER_EMAIL, OWNER_PASSWORD (12+ characters) and MONGODB_URI locally before running this script.",
  );
await mongoose.connect(MONGODB_URI);
try {
  if (
    await User.exists({
      $or: [
        { email: OWNER_EMAIL.toLowerCase() },
        { username: OWNER_USERNAME.toLowerCase() },
      ],
    })
  )
    throw new Error(
      "An account already exists. Review and explicitly migrate its role instead of overwriting it.",
    );
  await User.create({
    username: OWNER_USERNAME,
    email: OWNER_EMAIL,
    password: OWNER_PASSWORD,
    role: "SUPER_ADMIN",
  });
  console.log("Platform owner created. No credentials were printed.");
} finally {
  await mongoose.disconnect();
}
