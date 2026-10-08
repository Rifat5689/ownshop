import { Router } from "express";
import { createOrder, getOrder, getAllOrders, getDashboardsummary, getDashboardAnalytics } from "./order.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.route("/").post(verifyJwt, createOrder).get(verifyJwt, getOrder);
orderRouter.route("/all/:status").get(verifyJwt, getAllOrders);
orderRouter.route("/dashboard/summary").get(verifyJwt, getDashboardsummary);
orderRouter.route("/dashboard/analytics").post(verifyJwt, getDashboardAnalytics);

export { orderRouter };