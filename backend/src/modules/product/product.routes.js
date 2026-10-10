import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  deleteAllProducts,
  getAllPrdoucts,
  getStoreProducts,
  getProductById,
  getProductByslug,
  updateProduct,
  uploadProductImages,
} from "./product.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import { productImages } from "../../middlewares/product-images.middleware.js";
import {
  requireRoles,
  requireTenant,
  resolveStore,
} from "../../middlewares/tenant.middleware.js";
const productRouter = Router();
productRouter.route("/store/:storeSlug").get(resolveStore, getStoreProducts);
productRouter
  .route("/store/:storeSlug/:slug")
  .get(resolveStore, getProductByslug);
productRouter.use(verifyJwt, requireRoles("ADMIN", "ECO", "SUPER_ADMIN"));
productRouter.post(
  "/images",
  requireTenant,
  productImages,
  uploadProductImages,
);
productRouter
  .route("/")
  .get(
    (req, res, next) =>
      req.user.role === "SUPER_ADMIN" ? next() : requireTenant(req, res, next),
    getAllPrdoucts,
  )
  .post(requireTenant, createProduct)
  .delete(requireTenant, deleteAllProducts);
productRouter
  .route("/:id")
  .get(requireTenant, getProductById)
  .patch(requireTenant, updateProduct)
  .delete(requireTenant, deleteProduct);
export { productRouter };
