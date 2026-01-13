// checkDatabase.js - Quick script to check if data exists
import mongoose from "mongoose";
import dotenv from "dotenv";
import KYC from "./models/KYC.js";
import Withdrawal from "./models/Withdrawal.js";
import User from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ks4pharmanet";

const checkData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const userCount = await User.countDocuments();
    const kycCount = await KYC.countDocuments();
    const withdrawalCount = await Withdrawal.countDocuments();

    console.log("\n📊 Database Status:");
    console.log(`   Users: ${userCount}`);
    console.log(`   KYC Records: ${kycCount}`);
    console.log(`   Withdrawals: ${withdrawalCount}`);

    if (kycCount > 0) {
      console.log("\n📋 KYC Records:");
      const kycs = await KYC.find().populate("userId", "firstName lastName email");
      kycs.forEach(kyc => {
        console.log(`   - ${kyc.userId.firstName} ${kyc.userId.lastName}: ${kyc.status}`);
      });
    }

    if (withdrawalCount > 0) {
      console.log("\n💰 Withdrawal Records:");
      const withdrawals = await Withdrawal.find().populate("userId", "firstName lastName");
      withdrawals.forEach(w => {
        console.log(`   - ${w.userId.firstName} ${w.userId.lastName}: ₹${w.amount} (${w.status})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkData();
