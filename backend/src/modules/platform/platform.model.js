import mongoose from "mongoose";
const platformSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "platform" },
    name: { type: String, default: "OwnShop" },
    supportEmail: { type: String, default: "" },
    currency: { type: String, enum: ["BDT"], default: "BDT" },
    timezone: { type: String, default: "Asia/Dhaka" },
  },
  { timestamps: true },
);
export default mongoose.model("Platform", platformSchema);
