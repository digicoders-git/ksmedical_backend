// models/Withdrawal.js
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    // Withdrawal Details
    amount: {
      type: Number,
      required: true,
      min: 500 // Minimum withdrawal amount
    },
    fee: {
      type: Number,
      default: 50
    },
    netAmount: {
      type: Number,
      required: true
    },
    
    // Payment Method Details
    paymentMethod: {
      type: {
        type: String,
        enum: ["bank", "upi"],
        required: true
      },
      // Bank Details
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolder: String,
      // UPI Details
      upiId: String
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected"],
      default: "pending"
    },
    
    // Reference ID
    referenceId: {
      type: String,
      unique: true,
      required: true
    },
    
    // KYC Verification
    kycStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      required: true
    },
    
    // User Details (cached for quick access)
    userDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
      panCard: String,
      aadharCard: String
    },
    
    // Admin Actions
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectReason: {
      type: String,
      default: null
    },
    
    // Transaction Details
    transactionId: {
      type: String,
      default: null
    },
    transactionProof: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Generate unique reference ID before saving
withdrawalSchema.pre("save", async function (next) {
  if (!this.referenceId) {
    const count = await mongoose.model("Withdrawal").countDocuments();
    this.referenceId = `WD${String(count + 1).padStart(5, "0")}`;
  }
  
  // Calculate net amount
  this.netAmount = this.amount - this.fee;
  
  next();
});

// Indexes for faster queries
withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ kycStatus: 1 });
withdrawalSchema.index({ referenceId: 1 });

export default mongoose.model("Withdrawal", withdrawalSchema);
