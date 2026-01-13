// routes/withdrawalRoutes.js
import express from "express";
import {
  createWithdrawalRequest,
  getUserWithdrawals,
  getAllWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
  completeWithdrawal,
  getWithdrawalStats
} from "../controllers/withdrawalController.js";

const router = express.Router();

// User routes
router.post("/create", createWithdrawalRequest);
router.get("/user/:userId", getUserWithdrawals);

// Admin routes
router.get("/all", getAllWithdrawals);
router.get("/stats", getWithdrawalStats);
router.get("/:id", getWithdrawalById);
router.put("/approve/:id", approveWithdrawal);
router.put("/reject/:id", rejectWithdrawal);
router.put("/complete/:id", completeWithdrawal);

export default router;
