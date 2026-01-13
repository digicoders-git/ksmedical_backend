// models/MLM.js - MLM Referral System Model
import mongoose from "mongoose";

const mlmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    
    // Referral Code
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    
    // Referrer (who referred this user)
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    
    // Referral Stats
    totalReferrals: {
      type: Number,
      default: 0
    },
    activeReferrals: {
      type: Number,
      default: 0
    },
    
    // Level-wise referrals
    level1Referrals: {
      type: Number,
      default: 0
    },
    level2Referrals: {
      type: Number,
      default: 0
    },
    level3Referrals: {
      type: Number,
      default: 0
    },
    
    // Earnings
    totalEarnings: {
      type: Number,
      default: 0
    },
    availableBalance: {
      type: Number,
      default: 0
    },
    pendingWithdrawal: {
      type: Number,
      default: 0
    },
    monthlyEarnings: {
      type: Number,
      default: 0
    },
    
    // Referral List (Direct referrals)
    referrals: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      level: {
        type: Number,
        enum: [1, 2, 3],
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      },
      totalEarned: {
        type: Number,
        default: 0
      }
    }],
    
    // Commission Rates
    commissionRates: {
      level1: {
        type: Number,
        default: 10 // 10%
      },
      level2: {
        type: Number,
        default: 5 // 5%
      },
      level3: {
        type: Number,
        default: 2 // 2%
      }
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Generate unique referral code before saving
mlmSchema.pre("save", async function (next) {
  if (!this.referralCode) {
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "KS4";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let code = generateCode();
    let exists = await mongoose.model("MLM").findOne({ referralCode: code });
    
    while (exists) {
      code = generateCode();
      exists = await mongoose.model("MLM").findOne({ referralCode: code });
    }
    
    this.referralCode = code;
  }
  next();
});

// Indexes
mlmSchema.index({ userId: 1 });
mlmSchema.index({ referralCode: 1 });
mlmSchema.index({ referredBy: 1 });

export default mongoose.model("MLM", mlmSchema);
