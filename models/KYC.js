// models/KYC.js
import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    
    // Personal Information
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    
    // Document Information
    panCard: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },
    aadharCard: {
      type: String,
      required: true,
      match: /^[0-9]{12}$/
    },
    
    // Document Images (Cloudinary URLs)
    documents: {
      panImage: {
        type: String,
        required: true
      },
      aadharFrontImage: {
        type: String,
        required: true
      },
      aadharBackImage: {
        type: String,
        required: true
      },
      bankPassbook: {
        type: String,
        required: true
      },
      selfie: {
        type: String,
        required: true
      }
    },
    
    // Verification Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    
    // Rejection Details
    rejectReason: {
      type: String,
      default: null
    },
    
    // Approval/Rejection Details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    
    // Submission Date
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });

export default mongoose.model("KYC", kycSchema);
