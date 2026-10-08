import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {
  requireRoles,
  requireTenant,
  resolveStore,
} from "../../middlewares/tenant.middleware.js";
const categoryRouter = Router();
categoryRouter.route("/store/:storeSlug").get(resolveStore, listCategories);
categoryRouter.use(
  verifyJwt,
  requireRoles("ADMIN", "ECO", "SUPER_ADMIN"),
  requireTenant,
);
categoryRouter.route("/").get(listCategories).post(createCategory);
categoryRouter.route("/:id").patch(updateCategory).delete(deleteCategory);
export { categoryRouter };
