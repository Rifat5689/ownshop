import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Store from "./store.model.js";
import { uploadProductImage } from "../../services/product-images.service.js";
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
  res.json(
    new ApiResponse(
      200,
      req.user
        ? req.store
        : {
            _id: req.store._id,
            name: req.store.name,
            slug: req.store.slug,
            description: req.store.description,
            shippingFee: req.store.shippingFee,
            shippingFees: req.store.shippingFees,
            useZoneShippingFees: req.store.useZoneShippingFees,
            showShippingFees: req.store.showShippingFees,
            whatsappNumber: req.store.whatsappNumber,
            profileImage: req.store.profileImage,
            supportEmail: req.store.supportEmail,
            status: req.store.status,
          },
      "Store fetched",
    ),
  ),
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
          "shippingFees",
          "useZoneShippingFees",
          "showShippingFees",
          "whatsappNumber",
          "supportEmail",
        ]
      : [
          "name",
          "description",
          "shippingFee",
          "shippingFees",
          "useZoneShippingFees",
          "showShippingFees",
          "whatsappNumber",
          "supportEmail",
        ];
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
const uploadStoreProfile = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "Choose a store image");
  const image = await uploadProductImage(
    req.files[0],
    req.store._id,
    "profile",
  );
  const store = await Store.findByIdAndUpdate(
    req.store._id,
    { profileImage: image },
    { new: true, runValidators: true },
  );
  return res
    .status(201)
    .json(new ApiResponse(201, store.profileImage, "Store image uploaded"));
});
export {
  createStore,
  getStores,
  getPublicStores,
  getStore,
  updateStore,
  uploadStoreProfile,
};
