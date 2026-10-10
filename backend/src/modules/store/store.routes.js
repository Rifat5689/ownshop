import { Router } from "express";
import {
  createStore,
  getStores,
  getPublicStores,
  getStore,
  updateStore,
  uploadStoreProfile,
} from "./store.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {
  requireRoles,
  requireTenant,
  resolveStore,
} from "../../middlewares/tenant.middleware.js";
import { productImages } from "../../middlewares/product-images.middleware.js";
const storeRoutes = Router();
storeRoutes.route("/public").get(getPublicStores);
storeRoutes.route("/slug/:storeSlug").get(resolveStore, getStore);
storeRoutes
  .route("/mine")
  .get(verifyJwt, requireRoles("ADMIN", "ECO"), requireTenant, getStore)
  .patch(verifyJwt, requireRoles("ADMIN"), requireTenant, updateStore);
storeRoutes.post(
  ["/mine/profile-image", "/mine/profile-photo"],
  verifyJwt,
  requireRoles("ADMIN"),
  requireTenant,
  productImages,
  uploadStoreProfile,
);
storeRoutes
  .route("/")
  .get(verifyJwt, requireRoles("SUPER_ADMIN"), getStores)
  .post(verifyJwt, requireRoles("SUPER_ADMIN"), createStore);
storeRoutes
  .route("/:id")
  .patch(verifyJwt, requireRoles("SUPER_ADMIN"), updateStore);
export { storeRoutes };
