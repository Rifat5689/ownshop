import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    browserId: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, maxlength: 40 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
customerSchema.index({ tenantId: 1, browserId: 1 }, { unique: true });

export default mongoose.model("Customer", customerSchema);
