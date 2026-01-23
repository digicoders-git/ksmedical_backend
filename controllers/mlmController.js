// controllers/mlmController.js
import MLM from "../models/MLM.js";
import MLMTransaction from "../models/MLMTransaction.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// @desc    Get MLM dashboard data for a user
// @route   GET /api/mlm/dashboard/:userId
// @access  Private
export const getMLMDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "Invalid User ID format. Please use a valid MongoDB ObjectId.",
        suggestion: "If you are testing, use a real ID from your Users collection."
      });
    }

    // Check if user exists check
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get MLM data
    let mlmData = await MLM.findOne({ userId }).populate("userId", "firstName lastName email");
    
    if (!mlmData) {
      // Create MLM record if doesn't exist
      mlmData = await MLM.create({ userId });
      await mlmData.populate("userId", "firstName lastName email");
    }

    // Get recent transactions
    const recentTransactions = await MLMTransaction.find({ userId })
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    res.json({
      referralCode: mlmData.referralCode,
      totalReferrals: mlmData.totalReferrals,
      activeReferrals: mlmData.activeReferrals,
      totalEarnings: mlmData.totalEarnings,
      availableBalance: mlmData.availableBalance,
      pendingWithdrawal: mlmData.pendingWithdrawal,
      level1Referrals: mlmData.level1Referrals,
      level2Referrals: mlmData.level2Referrals,
      level3Referrals: mlmData.level3Referrals,
      monthlyEarnings: mlmData.monthlyEarnings,
      commissionRates: mlmData.commissionRates,
      recentTransactions: recentTransactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        date: t.transactionDate,
        description: t.description
      }))
    });
  } catch (error) {
    console.error("Get MLM dashboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's referral list
// @route   GET /api/mlm/referrals/:userId
// @access  Private
export const getUserReferrals = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "Invalid User ID format. Please use a valid MongoDB ObjectId."
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const mlmData = await MLM.findOne({ userId })
      .populate({
        path: "referrals.userId",
        select: "firstName lastName email phone createdAt"
      });

    if (!mlmData) {
      return res.status(404).json({ message: "MLM data not found" });
    }

    const referralsList = mlmData.referrals.map(ref => ({
      id: ref._id,
      userId: ref.userId._id,
      name: `${ref.userId.firstName} ${ref.userId.lastName}`,
      email: ref.userId.email,
      phone: ref.userId.phone,
      level: ref.level,
      joinedAt: ref.joinedAt,
      isActive: ref.isActive,
      totalEarned: ref.totalEarned
    }));

    res.json({
      totalReferrals: mlmData.totalReferrals,
      referrals: referralsList
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a referral (when someone registers with referral code)
// @route   POST /api/mlm/add-referral
// @access  Private
export const addReferral = async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;

    // Find referrer by code
    const referrer = await MLM.findOne({ referralCode });
    
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Create MLM record for new user
    const newUserMLM = await MLM.create({
      userId: newUserId,
      referredBy: referrer.userId
    });

    // Add to referrer's referral list (Level 1)
    referrer.referrals.push({
      userId: newUserId,
      level: 1,
      joinedAt: new Date(),
      isActive: true,
      totalEarned: 0
    });
    referrer.totalReferrals += 1;
    referrer.activeReferrals += 1;
    referrer.level1Referrals += 1;

    await referrer.save();

    // Add referral bonus transaction
    const bonusAmount = 500; // ₹500 bonus for each referral
    await MLMTransaction.create({
      userId: referrer.userId,
      type: "referral",
      amount: bonusAmount,
      description: "Level 1 Referral Bonus",
      relatedUser: newUserId,
      level: 1,
      status: "completed"
    });

    // Update referrer's earnings
    referrer.totalEarnings += bonusAmount;
    referrer.availableBalance += bonusAmount;
    referrer.monthlyEarnings += bonusAmount;
    await referrer.save();

    // Handle Level 2 and Level 3 referrals
    if (referrer.referredBy) {
      await handleMultiLevelReferral(referrer.referredBy, newUserId, 2);
    }

    res.status(201).json({
      message: "Referral added successfully",
      referralCode: newUserMLM.referralCode
    });
  } catch (error) {
    console.error("Add referral error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function for multi-level referrals
const handleMultiLevelReferral = async (referrerId, newUserId, level) => {
  if (level > 3) return; // Only 3 levels

  const referrer = await MLM.findOne({ userId: referrerId });
  if (!referrer) return;

  // Add to referrer's list
  referrer.referrals.push({
    userId: newUserId,
    level: level,
    joinedAt: new Date(),
    isActive: true,
    totalEarned: 0
  });
  
  referrer.totalReferrals += 1;
  referrer.activeReferrals += 1;
  
  if (level === 2) referrer.level2Referrals += 1;
  if (level === 3) referrer.level3Referrals += 1;

  // Calculate bonus based on level
  const bonusAmounts = { 2: 250, 3: 100 }; // Level 2: ₹250, Level 3: ₹100
  const bonusAmount = bonusAmounts[level];

  // Add transaction
  await MLMTransaction.create({
    userId: referrerId,
    type: "commission",
    amount: bonusAmount,
    description: `Level ${level} Referral Commission`,
    relatedUser: newUserId,
    level: level,
    status: "completed"
  });

  // Update earnings
  referrer.totalEarnings += bonusAmount;
  referrer.availableBalance += bonusAmount;
  referrer.monthlyEarnings += bonusAmount;
  await referrer.save();

  // Continue to next level
  if (referrer.referredBy) {
    await handleMultiLevelReferral(referrer.referredBy, newUserId, level + 1);
  }
};

// @desc    Get MLM transactions
// @route   GET /api/mlm/transactions/:userId
// @access  Private
export const getMLMTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 50 } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = { userId };
    if (type && type !== "all") {
      filter.type = type;
    }

    const transactions = await MLMTransaction.find(filter)
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit))
      .populate("relatedUser", "firstName lastName")
      .lean();

    res.json({
      count: transactions.length,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.transactionDate,
        status: t.status,
        level: t.level,
        relatedUser: t.relatedUser ? `${t.relatedUser.firstName} ${t.relatedUser.lastName}` : null
      }))
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get MLM statistics (Admin)
// @route   GET /api/mlm/stats
// @access  Private (Admin)
export const getMLMStats = async (req, res) => {
  try {
    const totalUsers = await MLM.countDocuments();
    const activeUsers = await MLM.countDocuments({ isActive: true });
    
    const totalEarningsResult = await MLM.aggregate([
      { $group: { _id: null, total: { $sum: "$totalEarnings" } } }
    ]);
    
    const totalReferralsResult = await MLM.aggregate([
      { $group: { _id: null, total: { $sum: "$totalReferrals" } } }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalEarnings: totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0,
      totalReferrals: totalReferralsResult.length > 0 ? totalReferralsResult[0].total : 0
    });
  } catch (error) {
    console.error("Get MLM stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify referral code
// @route   GET /api/mlm/verify-code/:code
// @access  Public
export const verifyReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    const mlm = await MLM.findOne({ referralCode: code.toUpperCase() })
      .populate("userId", "firstName lastName");

    if (!mlm) {
      return res.status(404).json({ 
        valid: false,
        message: "Invalid referral code" 
      });
    }

    res.json({
      valid: true,
      referrerName: `${mlm.userId.firstName} ${mlm.userId.lastName}`,
      message: "Valid referral code"
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
