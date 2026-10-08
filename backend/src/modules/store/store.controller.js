import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Store from "./store.model.js";
const createStore = asyncHandler(async (req, res) => {
  const { name, slug, description = "", plan = "Basic" } = req.body;
  if (
    !name ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "") ||
    ["admin", "login", "stores"].includes(slug)
  )
    throw new ApiError(400, "Name and a valid unique store slug are required");
  const store = await Store.create({ name, slug, description, plan });
  return res.status(201).json(new ApiResponse(201, store, "Store created"));
});
const getStores = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Store.find().sort({ createdAt: -1 }),
      "Stores fetched",
    ),
  ),
);
const getPublicStores = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Store.find({ status: "ACTIVE" }).select("name slug description"),
      "Stores fetched",
    ),
  ),
);
const getStore = asyncHandler(async (req, res) =>
  res.json(new ApiResponse(200, req.store, "Store fetched")),
);
const updateStore = asyncHandler(async (req, res) => {
  const fields =
    req.user.role === "SUPER_ADMIN"
      ? [
          "name",
          "description",
          "status",
          "plan",
          "subscriptionStatus",
          "renewalDate",
          "shippingFee",
          "supportEmail",
        ]
      : ["name", "description", "shippingFee", "supportEmail"];
  const data = Object.fromEntries(
    fields
      .filter((key) => req.body[key] !== undefined)
      .map((key) => [key, req.body[key]]),
  );
  const id = req.user.role === "SUPER_ADMIN" ? req.params.id : req.store._id;
  const store = await Store.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!store) throw new ApiError(404, "Store not found");
  return res.json(new ApiResponse(200, store, "Store updated"));
});
export { createStore, getStores, getPublicStores, getStore, updateStore };
