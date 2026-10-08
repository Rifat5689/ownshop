import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Category from "./category.model.js";
import Product from "../product/product.model.js";
const listCategories = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Category.find({ tenantId: req.store._id }).sort({ name: 1 }),
      "Categories fetched",
    ),
  ),
);
const createCategory = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) throw new ApiError(400, "Category name required");
  const slug = req.body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new ApiError(400, "Category requires an English URL name");
  const category = await Category.create({
    name: req.body.name,
    slug,
    tenantId: req.store._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created"));
});
const updateCategory = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) throw new ApiError(400, "Category name required");
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.store._id },
    { name: req.body.name },
    { new: true, runValidators: true },
  );
  if (!category) throw new ApiError(404, "Category not found");
  return res.json(new ApiResponse(200, category, "Category updated"));
});
const deleteCategory = asyncHandler(async (req, res) => {
  if (
    await Product.exists({ category: req.params.id, tenantId: req.store._id })
  )
    throw new ApiError(409, "Remove this category from its products first");
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.store._id,
  });
  if (!category) throw new ApiError(404, "Category not found");
  return res.json(new ApiResponse(200, null, "Category deleted"));
});
export { listCategories, createCategory, updateCategory, deleteCategory };
