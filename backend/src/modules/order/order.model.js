import { model, Schema } from "mongoose";
const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
  },
  { _id: false },
);
const orderSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    orderItems: [orderItemSchema],
    shippingDetails: { name: String, phone: String, address: String },
    customerUsername: { type: String, trim: true, maxlength: 40, default: "" },
    shippingZone: {
      type: String,
      enum: ["insideDhaka", "outsideDhaka"],
      default: "insideDhaka",
    },
    shippingFee: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    payment: {
      paymentMethod: {
        type: String,
        enum: ["cash on delivery"],
        default: "cash on delivery",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    idempotencyKey: { type: String, required: true },
    requestHash: { type: String, required: true },
    trackingToken: { type: String, required: true, select: false },
  },
  { timestamps: true },
);
orderSchema.index(
  { tenantId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      tenantId: { $type: "objectId" },
      idempotencyKey: { $type: "string" },
    },
  },
);
const Order = model("Order", orderSchema);
export default Order;
