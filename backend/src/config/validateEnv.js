import ApiError from "../utils/ApiError.js";
const validateEnv = () => {
  const missing = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
  ].filter((key) => !process.env[key]);
  if (missing.length)
    throw new ApiError(
      500,
      `Required environment settings are missing: ${missing.join(", ")}`,
    );
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.ACCESS_TOKEN_SECRET.length < 32 ||
      process.env.REFRESH_TOKEN_SECRET.length < 32 ||
      process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET)
  )
    throw new ApiError(
      500,
      "Production token secrets must be distinct and at least 32 characters long",
    );
};
export { validateEnv };
