import mongoose from "mongoose";
import { randomBytes, createHash } from "node:crypto";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Order from "./order.model.js";
import Product from "../product/product.model.js";
import {
  calculatePrice,
  validateCheckout,
  transitions,
} from "./order.utils.js";

const createOrder = asyncHandler(async (req, res) => {
  validateCheckout(req.body);
  const key = req.get("Idempotency-Key");
  if (!key || !/^[a-zA-Z0-9-]{16,100}$/.test(key))
    throw new ApiError(400, "A valid Idempotency-Key is required");
  const shippingDetails = Object.fromEntries(
    ["name", "phone", "address"].map((field) => [
      field,
      req.body.shippingDetails[field].trim(),
    ]),
  );
  shippingDetails.phone = shippingDetails.phone.replace(/\D/g, "");
  const requestHash = createHash("sha256")
    .update(
      JSON.stringify({
        orderItems: req.body.orderItems,
        shippingDetails,
        shippingZone: req.body.shippingZone,
        customerUsername: req.body.customerUsername,
      }),
    )
    .digest("hex");
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne({
        tenantId: req.store._id,
        idempotencyKey: key,
      })
        .select("+trackingToken")
        .session(session);
      if (order) {
        if (order.requestHash !== requestHash)
          throw new ApiError(
            409,
            "Checkout key was already used for a different order",
          );
        return;
      }
      const items = [];
      for (const item of req.body.orderItems) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            tenantId: req.store._id,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true, session },
        );
        if (!product)
          throw new ApiError(
            409,
            "A product is unavailable or has insufficient stock. Please review your cart.",
          );
        items.push({
          productId: product._id,
          name: product.name,
          price: calculatePrice(product),
          quantity: item.quantity,
        });
      }
      const shippingZone = req.body.shippingZone || "insideDhaka";
      const shippingFee = req.store.useZoneShippingFees
        ? req.store.shippingFees?.[shippingZone] || 0
        : req.store.shippingFee || 0;
      const totalPrice =
        Math.round(
          (items.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
          ) +
            shippingFee) *
            100,
        ) / 100;
      [order] = await Order.create(
        [
          {
            tenantId: req.store._id,
            orderItems: items,
            shippingDetails,
            customerUsername: String(req.body.customerUsername || "").trim(),
            shippingZone,
            shippingFee,
            totalPrice,
            payment: {
              paymentMethod: "cash on delivery",
              paymentStatus: "pending",
            },
            idempotencyKey: key,
            requestHash,
            trackingToken: randomBytes(32).toString("hex"),
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        trackingToken: order.trackingToken,
      },
      "Order placed",
    ),
  );
});
const getOrder = asyncHandler(async (req, res) => {
  const token = req.get("X-Tracking-Token");
  if (!token) throw new ApiError(401, "Order tracking token required");
  const order = await Order.findOne({
    _id: req.params.id,
    tenantId: req.store._id,
    trackingToken: token,
  }).select("-idempotencyKey -requestHash");
  if (!order) throw new ApiError(404, "Order not found");
  return res.json(new ApiResponse(200, order, "Order fetched"));
});
const getAllOrders = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "SUPER_ADMIN" ? {} : { tenantId: req.store._id };
  if (req.query.status && req.query.status !== "all")
    query.status = req.query.status;
  return res.json(
    new ApiResponse(
      200,
      await Order.find(query)
        .select("-idempotencyKey -requestHash")
        .sort({ createdAt: -1 })
        .limit(500),
      "Orders fetched",
    ),
  );
});
const getAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    tenantId: req.store._id,
  }).select("-idempotencyKey -requestHash");
  if (!order) throw new ApiError(404, "Order not found");
  return res.json(new ApiResponse(200, order, "Order fetched"));
});
const updateOrder = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne({
        _id: req.params.id,
        tenantId: req.store._id,
      }).session(session);
      if (!order) throw new ApiError(404, "Order not found");
      if (!transitions[order.status]?.includes(status))
        throw new ApiError(400, "Invalid order status transition");
      if (status === "cancelled" || status === "returned") {
        for (const item of order.orderItems)
          await Product.updateOne(
            { _id: item.productId, tenantId: req.store._id },
            { $inc: { stock: item.quantity } },
            { session },
          );
      }
      order.status = status;
      if (status === "delivered") order.payment.paymentStatus = "paid";
      if (status === "returned") order.payment.paymentStatus = "pending";
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return res.json(new ApiResponse(200, order, "Order updated"));
});
const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Order.aggregate([
    { $match: { tenantId: req.store._id } },
    {
      $group: {
        _id: "$shippingDetails.phone",
        name: { $last: "$shippingDetails.name" },
        address: { $last: "$shippingDetails.address" },
        username: { $last: "$customerUsername" },
        orders: { $sum: 1 },
        total: { $sum: "$totalPrice" },
      },
    },
  ]);
  return res.json(new ApiResponse(200, customers, "Customers fetched"));
});
export {
  createOrder,
  getOrder,
  getAllOrders,
  getAdminOrder,
  updateOrder,
  getCustomers,
};
