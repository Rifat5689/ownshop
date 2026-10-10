import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { storeRoutes } from "./modules/store/store.routes.js";
import { productRouter as productRoutes } from "./modules/product/product.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { customerRouter } from "./modules/customer/customer.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { categoryRouter } from "./modules/category/category.routes.js";
import ApiError from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { platformRouter } from "./modules/platform/platform.routes.js";
import mongoose from "mongoose";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { createHash } from "node:crypto";
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
const allowedOrigins = [
  "https://ornionshop.web.app",
  "https://ornionshop.firebaseapp.com",
  "https://ownersuite.web.app",
  "https://ownersuite.firebaseapp.com",
  "https://localhost",
  "capacitor://localhost",
];
const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          developmentOrigins.includes(origin)) ||
        configuredOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new ApiError(403, "Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
const clientKey = (req) => ipKeyGenerator(req.ip);
const limitResponse = (req, res) =>
  res.status(429).json({
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
    errors: [],
  });
app.use(
  "/api/v1/users/auth/login",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 10,
    skipSuccessfulRequests: true,
    keyGenerator: clientKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: limitResponse,
  }),
);
app.use(
  "/api/v1/users/auth",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 60,
    keyGenerator: clientKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: limitResponse,
  }),
);
app.use(
  "/api/v1/users/auth/login",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 10,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      const identifier = req.body?.email || req.body?.username;
      return typeof identifier === "string"
        ? `account:${createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex")}`
        : clientKey(req);
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: limitResponse,
  }),
);
app.use(
  "/api/v1/orders/store",
  rateLimit({
    windowMs: 60000,
    limit: 30,
    keyGenerator: clientKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: limitResponse,
  }),
);
app.get("/api/v1/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  return res
    .status(ready ? 200 : 503)
    .json(
      new ApiResponse(
        ready ? 200 : 503,
        { database: ready ? "connected" : "unavailable" },
        ready ? "Ready" : "Database unavailable",
      ),
    );
});

// Routes declaration
app.use("/api/v1", (req, res, next) => {
  if (mongoose.connection.readyState !== 1)
    return next(new ApiError(503, "Database unavailable"));
  return next();
});
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/platform", platformRouter);
app.use((req, res, next) => next(new ApiError(404, "Endpoint not found")));

// Global Error Handler
app.use((err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
    message = "Invalid input";
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = "This record already exists";
  }
  if (err.name === "MulterError") {
    statusCode = 400;
    message = "Upload at most six images, each smaller than 5 MB";
  }
  if (statusCode >= 500 && process.env.NODE_ENV === "production")
    message = "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: statusCode >= 500 ? [] : err.errors || [],
  });
});

export { app };
