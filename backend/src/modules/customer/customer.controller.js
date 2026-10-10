import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Customer from "./customer.model.js";
import User from "../user/user.model.js";

const signInCustomer = asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim();
  const browserId = String(req.body.browserId || "").trim();
  if (
    !/^[\p{L}\p{N}_. -]{2,40}$/u.test(username) ||
    !/^[a-zA-Z0-9-]{16,100}$/.test(browserId)
  )
    throw new ApiError(400, "Enter a valid username");
  const customer = await Customer.findOneAndUpdate(
    { tenantId: req.store._id, browserId },
    { $set: { username, lastSeenAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const isMerchant = Boolean(
    await User.exists({
      tenantId: req.store._id,
      username: username.toLowerCase(),
      role: { $in: ["ADMIN", "ECO"] },
      isActive: { $ne: false },
    }),
  );
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { username: customer.username, isMerchant },
        "Customer identity saved",
      ),
    );
});

const getSignedCustomers = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await Customer.find({ tenantId: req.store._id })
        .select("username createdAt lastSeenAt")
        .sort({ lastSeenAt: -1 })
        .limit(500),
      "Signed customers fetched",
    ),
  ),
);

export { signInCustomer, getSignedCustomers };
