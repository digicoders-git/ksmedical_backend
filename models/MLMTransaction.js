// models/MLMTransaction.js - MLM Transaction History
import mongoose from "mongoose";

const mlmTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    // Transaction Type
    type: {
      type: String,
      enum: ["referral", "task", "withdrawal", "bonus", "commission"],
      required: true
    },
    
    // Amount
    amount: {
      type: Number,
      required: true
    },
    
    // Description
    description: {
      type: String,
      required: true
    },
    
    // Related User (for referral commissions)
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    
    // Level (for commission tracking)
    level: {
      type: Number,
      enum: [1, 2, 3],
      default: null
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed"
    },
    
    // Transaction Date
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes
mlmTransactionSchema.index({ userId: 1 });
mlmTransactionSchema.index({ type: 1 });
mlmTransactionSchema.index({ transactionDate: -1 });

export default mongoose.model("MLMTransaction", mlmTransactionSchema);
