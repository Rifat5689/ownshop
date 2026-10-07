import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { storeRoutes } from "./modules/store/store.routes.js";
import { productRoutes } from "./modules/product/product.routes.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(helmet());
const allowedOrigins = [
    'https://ornionshop.web.app',
    'https://ownersuite.web.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes declaration
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export { app };
