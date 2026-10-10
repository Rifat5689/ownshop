import { Router } from "express";
import { getSignedCustomers, signInCustomer } from "./customer.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {
  requireRoles,
  requireTenant,
  resolveStore,
} from "../../middlewares/tenant.middleware.js";

const customerRouter = Router();
customerRouter.route("/store/:storeSlug").post(resolveStore, signInCustomer);
customerRouter
  .route("/signed")
  .get(
    verifyJwt,
    requireRoles("ADMIN", "ECO"),
    requireTenant,
    getSignedCustomers,
  );

export { customerRouter };
