import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);
categorySchema.index(
  { tenantId: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      tenantId: { $type: "objectId" },
      slug: { $type: "string" },
    },
  },
);
const Category = mongoose.model("Category", categorySchema);
export default Category;
