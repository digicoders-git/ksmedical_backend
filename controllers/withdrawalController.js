// controllers/withdrawalController.js
import Withdrawal from "../models/Withdrawal.js";
import KYC from "../models/KYC.js";
import User from "../models/User.js";

// @desc    Create withdrawal request
// @route   POST /api/withdrawals/create
// @access  Private (User)
export const createWithdrawalRequest = async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check KYC status
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return res.status(400).json({ 
        message: "KYC not submitted. Please complete KYC verification first.",
        kycStatus: "not_submitted"
      });
    }

    if (kyc.status !== "approved") {
      return res.status(400).json({ 
        message: `KYC is ${kyc.status}. Only approved KYC users can request withdrawals.`,
        kycStatus: kyc.status
      });
    }

    // Validate amount
    if (amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹500" });
    }

    // TODO: Check user's available balance
    // const userBalance = await getUserBalance(userId);
    // if (amount > userBalance) {
    //   return res.status(400).json({ message: "Insufficient balance" });
    // }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      fee: 50,
      paymentMethod,
      status: "pending",
      kycStatus: "verified",
      userDetails: {
        name: kyc.fullName,
        email: kyc.email,
        phone: kyc.phone,
        address: kyc.address,
        panCard: kyc.panCard,
        aadharCard: kyc.aadharCard
      }
    });

    res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawal: {
        id: withdrawal._id,
        referenceId: withdrawal.referenceId,
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        netAmount: withdrawal.netAmount,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    console.error("Create withdrawal request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawals/user/:userId
// @access  Private (User)
export const getUserWithdrawals = async (req, res) => {
  try {
    const { userId } = req.params;

    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      count: withdrawals.length,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        fee: w.fee,
        netAmount: w.netAmount,
        method: w.paymentMethod.type === "bank" ? w.paymentMethod.bankName : "UPI",
        accountDetails: w.paymentMethod.type === "bank" 
          ? `****${w.paymentMethod.accountNumber.slice(-4)}`
          : w.paymentMethod.upiId,
        date: w.createdAt,
        status: w.status,
        referenceId: w.referenceId
      }))
    });
  } catch (error) {
    console.error("Get user withdrawals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/withdrawals/all
// @access  Private (Admin)
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status, kycStatus } = req.query;
    
    const filter = {};
    
    // Always filter by KYC verified users only
    filter.kycStatus = "verified";
    
    if (status && status !== "all") {
      filter.status = status;
    }

    const withdrawals = await Withdrawal.find(filter)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json({
      count: withdrawals.length,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        userId: w.userId._id,
        userName: `${w.userId.firstName} ${w.userId.lastName}`,
        amount: w.amount,
        fee: w.fee,
        method: w.paymentMethod.type === "bank" ? w.paymentMethod.bankName : "UPI",
        accountDetails: w.paymentMethod.type === "bank" 
          ? `Account: ****${w.paymentMethod.accountNumber.slice(-4)}`
          : `UPI: ${w.paymentMethod.upiId}`,
        bankAccount: w.paymentMethod.accountNumber,
        ifscCode: w.paymentMethod.ifscCode,
        upiId: w.paymentMethod.upiId,
        date: w.createdAt,
        status: w.status,
        referenceId: w.referenceId,
        kycStatus: w.kycStatus,
        userDetails: w.userDetails
      }))
    });
  } catch (error) {
    console.error("Get all withdrawals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single withdrawal details
// @route   GET /api/withdrawals/:id
// @access  Private (Admin/User)
export const getWithdrawalById = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await Withdrawal.findById(id)
      .populate("userId", "firstName lastName email phone");
    
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    res.json({
      id: withdrawal._id,
      userId: withdrawal.userId._id,
      userName: `${withdrawal.userId.firstName} ${withdrawal.userId.lastName}`,
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      netAmount: withdrawal.netAmount,
      method: withdrawal.paymentMethod.type === "bank" ? withdrawal.paymentMethod.bankName : "UPI",
      accountDetails: withdrawal.paymentMethod.type === "bank" 
        ? `Account: ****${withdrawal.paymentMethod.accountNumber.slice(-4)}`
        : `UPI: ${withdrawal.paymentMethod.upiId}`,
      bankAccount: withdrawal.paymentMethod.accountNumber,
      ifscCode: withdrawal.paymentMethod.ifscCode,
      upiId: withdrawal.paymentMethod.upiId,
      date: withdrawal.createdAt,
      status: withdrawal.status,
      referenceId: withdrawal.referenceId,
      kycStatus: withdrawal.kycStatus,
      userDetails: withdrawal.userDetails,
      approvedAt: withdrawal.approvedAt,
      completedAt: withdrawal.completedAt,
      rejectedAt: withdrawal.rejectedAt,
      rejectReason: withdrawal.rejectReason,
      transactionId: withdrawal.transactionId
    });
  } catch (error) {
    console.error("Get withdrawal by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve withdrawal request
// @route   PUT /api/withdrawals/approve/:id
// @access  Private (Admin)
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: `Withdrawal is already ${withdrawal.status}` });
    }

    withdrawal.status = "approved";
    withdrawal.approvedBy = adminId;
    withdrawal.approvedAt = new Date();

    await withdrawal.save();

    res.json({
      message: "Withdrawal approved successfully",
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        approvedAt: withdrawal.approvedAt
      }
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject withdrawal request
// @route   PUT /api/withdrawals/reject/:id
// @access  Private (Admin)
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: `Withdrawal is already ${withdrawal.status}` });
    }

    withdrawal.status = "rejected";
    withdrawal.approvedBy = adminId;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectReason = reason || "Rejected by admin";

    await withdrawal.save();

    res.json({
      message: "Withdrawal rejected successfully",
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        rejectedAt: withdrawal.rejectedAt,
        rejectReason: withdrawal.rejectReason
      }
    });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Complete withdrawal (Mark as paid)
// @route   PUT /api/withdrawals/complete/:id
// @access  Private (Admin)
export const completeWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, transactionProof } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "approved") {
      return res.status(400).json({ message: "Only approved withdrawals can be completed" });
    }

    withdrawal.status = "completed";
    withdrawal.completedAt = new Date();
    withdrawal.transactionId = transactionId;
    withdrawal.transactionProof = transactionProof;

    await withdrawal.save();

    res.json({
      message: "Withdrawal completed successfully",
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        completedAt: withdrawal.completedAt,
        transactionId: withdrawal.transactionId
      }
    });
  } catch (error) {
    console.error("Complete withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get withdrawal statistics
// @route   GET /api/withdrawals/stats
// @access  Private (Admin)
export const getWithdrawalStats = async (req, res) => {
  try {
    const total = await Withdrawal.countDocuments({ kycStatus: "verified" });
    const pending = await Withdrawal.countDocuments({ status: "pending", kycStatus: "verified" });
    const approved = await Withdrawal.countDocuments({ status: "approved", kycStatus: "verified" });
    const completed = await Withdrawal.countDocuments({ status: "completed", kycStatus: "verified" });
    const rejected = await Withdrawal.countDocuments({ status: "rejected", kycStatus: "verified" });

    const totalAmount = await Withdrawal.aggregate([
      { $match: { kycStatus: "verified" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      total,
      pending,
      approved,
      completed,
      rejected,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
    });
  } catch (error) {
    console.error("Get withdrawal stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
