// controllers/kycController.js
import KYC from "../models/KYC.js";
import User from "../models/User.js";

// @desc    Submit KYC for verification
// @route   POST /api/kyc/submit
// @access  Private (User)
export const submitKYC = async (req, res) => {
  try {
    const { userId, fullName, email, phone, address, panCard, aadharCard, documents } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if KYC already exists
    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      return res.status(400).json({ 
        message: "KYC already submitted", 
        status: existingKYC.status 
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panCard.toUpperCase())) {
      return res.status(400).json({ message: "Invalid PAN card format" });
    }

    // Validate Aadhar format
    const aadharRegex = /^[0-9]{12}$/;
    if (!aadharRegex.test(aadharCard.replace(/\s/g, ""))) {
      return res.status(400).json({ message: "Invalid Aadhar card format" });
    }

    // Create KYC
    const kyc = await KYC.create({
      userId,
      fullName,
      email,
      phone,
      address,
      panCard: panCard.toUpperCase(),
      aadharCard: aadharCard.replace(/\s/g, ""),
      documents: {
        panImage: documents.panImage,
        aadharFrontImage: documents.aadharFrontImage,
        aadharBackImage: documents.aadharBackImage,
        bankPassbook: documents.bankPassbook,
        selfie: documents.selfie
      },
      status: "pending",
      submittedAt: new Date()
    });

    res.status(201).json({
      message: "KYC submitted successfully",
      kyc: {
        id: kyc._id,
        status: kyc.status,
        submittedAt: kyc.submittedAt
      }
    });
  } catch (error) {
    console.error("Submit KYC error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get KYC status for a user
// @route   GET /api/kyc/status/:userId
// @access  Private (User)
export const getKYCStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const kyc = await KYC.findOne({ userId });
    
    if (!kyc) {
      return res.status(404).json({ 
        message: "KYC not found",
        status: "not_submitted"
      });
    }

    res.json({
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      rejectReason: kyc.rejectReason
    });
  } catch (error) {
    console.error("Get KYC status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all KYC requests (Admin)
// @route   GET /api/kyc/all
// @access  Private (Admin)
export const getAllKYCRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const kycRequests = await KYC.find(filter)
      .populate("userId", "firstName lastName email phone")
      .sort({ submittedAt: -1 });

    res.json({
      count: kycRequests.length,
      kycRequests: kycRequests.map(kyc => ({
        id: kyc._id,
        userId: kyc.userId._id,
        userName: `${kyc.userId.firstName} ${kyc.userId.lastName}`,
        email: kyc.email,
        phone: kyc.phone,
        submitDate: kyc.submittedAt,
        status: kyc.status,
        kycData: {
          fullName: kyc.fullName,
          address: kyc.address,
          panCard: kyc.panCard,
          aadharCard: kyc.aadharCard,
          panImage: kyc.documents.panImage,
          aadharFrontImage: kyc.documents.aadharFrontImage,
          aadharBackImage: kyc.documents.aadharBackImage,
          bankPassbook: kyc.documents.bankPassbook,
          selfie: kyc.documents.selfie
        },
        approvedDate: kyc.reviewedAt,
        rejectedDate: kyc.reviewedAt,
        rejectReason: kyc.rejectReason
      }))
    });
  } catch (error) {
    console.error("Get all KYC requests error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single KYC request details
// @route   GET /api/kyc/:id
// @access  Private (Admin)
export const getKYCById = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await KYC.findById(id).populate("userId", "firstName lastName email phone");
    
    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    res.json({
      id: kyc._id,
      userId: kyc.userId._id,
      userName: `${kyc.userId.firstName} ${kyc.userId.lastName}`,
      email: kyc.email,
      phone: kyc.phone,
      submitDate: kyc.submittedAt,
      status: kyc.status,
      kycData: {
        fullName: kyc.fullName,
        address: kyc.address,
        panCard: kyc.panCard,
        aadharCard: kyc.aadharCard,
        panImage: kyc.documents.panImage,
        aadharFrontImage: kyc.documents.aadharFrontImage,
        aadharBackImage: kyc.documents.aadharBackImage,
        bankPassbook: kyc.documents.bankPassbook,
        selfie: kyc.documents.selfie
      },
      reviewedAt: kyc.reviewedAt,
      rejectReason: kyc.rejectReason
    });
  } catch (error) {
    console.error("Get KYC by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve KYC
// @route   PUT /api/kyc/approve/:id
// @access  Private (Admin)
export const approveKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const kyc = await KYC.findById(id);
    
    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    if (kyc.status !== "pending") {
      return res.status(400).json({ message: `KYC is already ${kyc.status}` });
    }

    kyc.status = "approved";
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.rejectReason = null;

    await kyc.save();

    res.json({
      message: "KYC approved successfully",
      kyc: {
        id: kyc._id,
        status: kyc.status,
        reviewedAt: kyc.reviewedAt
      }
    });
  } catch (error) {
    console.error("Approve KYC error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject KYC
// @route   PUT /api/kyc/reject/:id
// @access  Private (Admin)
export const rejectKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const kyc = await KYC.findById(id);
    
    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    if (kyc.status !== "pending") {
      return res.status(400).json({ message: `KYC is already ${kyc.status}` });
    }

    kyc.status = "rejected";
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.rejectReason = reason;

    await kyc.save();

    res.json({
      message: "KYC rejected successfully",
      kyc: {
        id: kyc._id,
        status: kyc.status,
        reviewedAt: kyc.reviewedAt,
        rejectReason: kyc.rejectReason
      }
    });
  } catch (error) {
    console.error("Reject KYC error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get KYC statistics
// @route   GET /api/kyc/stats
// @access  Private (Admin)
export const getKYCStats = async (req, res) => {
  try {
    const total = await KYC.countDocuments();
    const pending = await KYC.countDocuments({ status: "pending" });
    const approved = await KYC.countDocuments({ status: "approved" });
    const rejected = await KYC.countDocuments({ status: "rejected" });

    res.json({
      total,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    console.error("Get KYC stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
