import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    licenseNumber: { type: String },
    gstNumber: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    image: { type: String }, // Base64 or URL
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);
