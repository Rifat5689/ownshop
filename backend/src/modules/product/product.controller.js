import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Product from "./product.model.js";
import Category from "../category/category.model.js";
import { generateUniqueSlug } from "../../services/slug.service.js";
import {
  deleteProductImages,
  uploadProductImage,
} from "../../services/product-images.service.js";
export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "Choose at least one image");
  const images = [];
  for (const file of req.files)
    images.push(await uploadProductImage(file, req.store._id));
  return res.status(201).json(new ApiResponse(201, images, "Images uploaded"));
});
const validateProduct = async (body, tenantId) => {
  if (
    body.price !== undefined &&
    (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)
  )
    throw new ApiError(400, "Invalid price");
  if (
    body.stock !== undefined &&
    (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)
  )
    throw new ApiError(400, "Stock must be a nonnegative integer");
  if (
    body.category &&
    !(await Category.findOne({ _id: body.category, tenantId }))
  )
    throw new ApiError(400, "Category does not belong to this store");
  if (
    body.images &&
    (!Array.isArray(body.images) ||
      body.images.some((image) => !/^https:\/\//.test(image.url || "")))
  )
    throw new ApiError(400, "Use HTTPS image URLs");
  if (body.descriptionSections !== undefined) {
    const allowed = new Set([
      "text",
      "bullets",
      "table",
      "highlights",
      "usage",
      "ingredients",
      "faq",
    ]);
    if (
      !Array.isArray(body.descriptionSections) ||
      body.descriptionSections.length > 20 ||
      body.descriptionSections.some(
        (section) =>
          !section ||
          !allowed.has(section.type) ||
          typeof section.title !== "string" ||
          section.title.length > 120 ||
          typeof section.enabled !== "boolean" ||
          typeof section.content !== "string" ||
          section.content.length > 10000 ||
          !Array.isArray(section.items) ||
          section.items.length > 100 ||
          section.items.some(
            (item) => typeof item !== "string" || item.length > 500,
          ) ||
          !Array.isArray(section.rows) ||
          section.rows.length > 100 ||
          section.rows.some(
            (row) =>
              !row ||
              typeof row.label !== "string" ||
              row.label.length > 120 ||
              typeof row.value !== "string" ||
              row.value.length > 500,
          ),
      )
    )
      throw new ApiError(400, "Invalid structured description");
  }
};
const fields = [
  "name",
  "description",
  "title",
  "subtitle",
  "shortDescription",
  "descriptionSections",
  "price",
  "category",
  "stock",
  "discount",
  "isActive",
  "images",
];
const pick = (body) =>
  Object.fromEntries(
    fields
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );
const createProduct = asyncHandler(async (req, res) => {
  if (!req.body.name || req.body.price === undefined)
    throw new ApiError(400, "Name and price are required");
  await validateProduct(req.body, req.store._id);
  const data = pick(req.body);
  if (!data.category) delete data.category;
  data.images = (data.images || []).map((image, index) => ({
    url: image.url,
    public_id: image.public_id || `external-${index}`,
  }));
  const product = await Product.create({
    ...data,
    tenantId: req.store._id,
    slug: await generateUniqueSlug(data.name),
  });
  return res.status(201).json(new ApiResponse(201, product, "Product created"));
});
const getAllPrdoucts = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Product.find(
        req.user.role === "SUPER_ADMIN" ? {} : { tenantId: req.store._id },
      )
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(500),
      "Products fetched",
    ),
  ),
);
const getStoreProducts = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Product.find({ tenantId: req.store._id, isActive: true })
        .select("-images.public_id -totalViews -__v -createdAt -updatedAt")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(500),
      "Products fetched",
    ),
  ),
);
const getProductByslug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    tenantId: req.store._id,
    slug: req.params.slug,
    isActive: true,
  })
    .select("-images.public_id -totalViews -__v -createdAt -updatedAt")
    .populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found");
  return res.json(new ApiResponse(200, product, "Product fetched"));
});
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    tenantId: req.store._id,
  });
  if (!product) throw new ApiError(404, "Product not found");
  return res.json(new ApiResponse(200, product, "Product fetched"));
});
const updateProduct = asyncHandler(async (req, res) => {
  await validateProduct(req.body, req.store._id);
  const data = pick(req.body);
  if (data.category === "") data.category = null;
  if (data.images)
    data.images = data.images.map((image, index) => ({
      url: image.url,
      public_id: image.public_id || `external-${index}`,
    }));
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.store._id },
    data,
    { new: true, runValidators: true },
  );
  if (!product) throw new ApiError(404, "Product not found");
  return res.json(new ApiResponse(200, product, "Product updated"));
});
const deleteProduct = asyncHandler(async (req, res) => {
  const filter = {
    _id: req.params.id,
    tenantId: req.store._id,
  };
  const product = await Product.findOne(filter);
  if (!product) throw new ApiError(404, "Product not found");
  await deleteProductImages(product.images, req.store._id);
  await Product.deleteOne(filter);
  return res.json(new ApiResponse(200, null, "Product deleted"));
});
const deleteAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ tenantId: req.store._id }).select("images");
  const images = products.flatMap((product) => product.images || []);
  const deletedImages = await deleteProductImages(images, req.store._id);
  const result = await Product.deleteMany({ tenantId: req.store._id });
  return res.json(
    new ApiResponse(
      200,
      { deletedProducts: result.deletedCount, deletedImages },
      "All store products and uploaded images deleted",
    ),
  );
});
export {
  createProduct,
  getAllPrdoucts,
  getStoreProducts,
  getProductById,
  getProductByslug,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
};
