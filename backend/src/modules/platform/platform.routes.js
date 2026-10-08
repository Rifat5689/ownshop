import { Router } from "express";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {
  requireRoles,
  requireTenant,
} from "../../middlewares/tenant.middleware.js";
import {
  getSettings,
  updateSettings,
  getSummary,
} from "./platform.controller.js";
const platformRouter = Router();
platformRouter.use(verifyJwt);
platformRouter
  .route("/summary")
  .get(
    requireRoles("SUPER_ADMIN", "ADMIN", "ECO"),
    (req, res, next) =>
      req.user.role === "SUPER_ADMIN" ? next() : requireTenant(req, res, next),
    getSummary,
  );
platformRouter
  .route("/settings")
  .get(requireRoles("SUPER_ADMIN"), getSettings)
  .patch(requireRoles("SUPER_ADMIN"), updateSettings);
export { platformRouter };
