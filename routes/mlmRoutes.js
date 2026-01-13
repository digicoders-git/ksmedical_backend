// routes/mlmRoutes.js
import express from "express";
import {
  getMLMDashboard,
  getUserReferrals,
  addReferral,
  getMLMTransactions,
  getMLMStats,
  verifyReferralCode
} from "../controllers/mlmController.js";

const router = express.Router();

// User routes
router.get("/dashboard/:userId", getMLMDashboard);
router.get("/referrals/:userId", getUserReferrals);
router.get("/transactions/:userId", getMLMTransactions);
router.post("/add-referral", addReferral);

// Public route
router.get("/verify-code/:code", verifyReferralCode);

// Admin routes
router.get("/stats", getMLMStats);

export default router;
