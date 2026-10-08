import ApiError from "../utils/ApiError.js";
import Store from "../modules/store/store.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const requireRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      throw new ApiError(403, "Permission denied");
    next();
  };
const resolveStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findOne({
    slug: req.params.storeSlug,
    status: "ACTIVE",
  });
  if (!store) throw new ApiError(404, "Store is unavailable");
  req.store = store;
  next();
});
const requireTenant = asyncHandler(async (req, res, next) => {
  const tenantId =
    req.user.role === "SUPER_ADMIN"
      ? req.body?.tenantId || req.query.tenantId
      : req.user.tenantId;
  if (!tenantId) throw new ApiError(400, "A store assignment is required");
  const store = await Store.findById(tenantId);
  if (!store || (req.user.role !== "SUPER_ADMIN" && store.status !== "ACTIVE"))
    throw new ApiError(403, "Store unavailable");
  const requestedSlug = req.get("X-Store-Slug");
  if (requestedSlug && req.user.role !== "SUPER_ADMIN" && requestedSlug !== store.slug)
    throw new ApiError(403, "Permission denied");
  req.store = store;
  next();
});
export { requireRoles, resolveStore, requireTenant };
