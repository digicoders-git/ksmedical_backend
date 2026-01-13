// routes/kycRoutes.js
import express from "express";
import {
  submitKYC,
  getKYCStatus,
  getAllKYCRequests,
  getKYCById,
  approveKYC,
  rejectKYC,
  getKYCStats
} from "../controllers/kycController.js";

const router = express.Router();

// User routes
router.post("/submit", submitKYC);
router.get("/status/:userId", getKYCStatus);

// Admin routes
router.get("/all", getAllKYCRequests);
router.get("/stats", getKYCStats);
router.get("/:id", getKYCById);
router.put("/approve/:id", approveKYC);
router.put("/reject/:id", rejectKYC);

export default router;
