import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Platform from "./platform.model.js";
import Store from "../store/store.model.js";
import User from "../user/user.model.js";
import Order from "../order/order.model.js";
import Product from "../product/product.model.js";
const getSettings = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      (await Platform.findOne({ key: "platform" })) || {
        name: "OwnShop",
        currency: "BDT",
        timezone: "Asia/Dhaka",
        supportEmail: "",
      },
      "Settings fetched",
    ),
  ),
);
const updateSettings = asyncHandler(async (req, res) => {
  const fields = ["name", "supportEmail", "currency", "timezone"];
  const data = Object.fromEntries(
    fields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]),
  );
  const settings = await Platform.findOneAndUpdate(
    { key: "platform" },
    { $set: data },
    { new: true, upsert: true, runValidators: true },
  );
  return res.json(new ApiResponse(200, settings, "Settings saved"));
});
const getSummary = asyncHandler(async (req, res) => {
  const days = req.query.days === "7" ? 7 : 30;
  const scope =
    req.user.role === "SUPER_ADMIN" ? {} : { tenantId: req.store._id };
  const [
    totalOrders,
    pendingOrders,
    products,
    revenue,
    customers,
    totalStores,
    activeStores,
    admins,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(scope),
    Order.countDocuments({ ...scope, status: "pending" }),
    Product.countDocuments(scope),
    Order.aggregate([
      {
        $match: {
          ...scope,
          "payment.paymentStatus": "paid",
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $match: scope },
      {
        $group: {
          _id: { tenantId: "$tenantId", phone: "$shippingDetails.phone" },
        },
      },
      { $count: "total" },
    ]),
    req.user.role === "SUPER_ADMIN" ? Store.countDocuments() : 0,
    req.user.role === "SUPER_ADMIN"
      ? Store.countDocuments({ status: "ACTIVE" })
      : 0,
    req.user.role === "SUPER_ADMIN"
      ? User.countDocuments({ role: { $in: ["ADMIN", "ECO"] } })
      : 0,
    Order.find(scope)
      .select("-idempotencyKey -requestHash")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);
  const daily = await Order.aggregate([
    {
      $match: {
        ...scope,
        createdAt: { $gte: new Date(Date.now() - days * 86400000) },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Dhaka",
          },
        },
        orders: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ["$payment.paymentStatus", "paid"] },
              "$totalPrice",
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const [storeStatus, topStores, recentStores] =
    req.user.role === "SUPER_ADMIN"
      ? await Promise.all([
          Store.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
          Order.aggregate([
            {
              $match: {
                "payment.paymentStatus": "paid",
                status: { $nin: ["cancelled", "returned"] },
              },
            },
            {
              $group: {
                _id: "$tenantId",
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "stores",
                localField: "_id",
                foreignField: "_id",
                as: "store",
              },
            },
            { $unwind: "$store" },
          ]),
          Store.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name slug status createdAt"),
        ])
      : [[], [], []];
  return res.json(
    new ApiResponse(
      200,
      {
        totalOrders,
        pendingOrders,
        products,
        totalRevenue: revenue[0]?.total || 0,
        totalCustomers: customers[0]?.total || 0,
        totalStores,
        activeStores,
        admins,
        recentOrders,
        daily,
        days,
        storeStatus,
        topStores,
        recentStores,
      },
      "Dashboard fetched",
    ),
  );
});
export { getSettings, updateSettings, getSummary };
