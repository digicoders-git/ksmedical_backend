// routes/productRoutes.js
import express from "express";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadProductImages } from "../config/cloudinary.js";

import multer from "multer";

const router = express.Router();

const csvStorage = multer.memoryStorage();
const uploadCsv = multer({ storage: csvStorage });

router.get("/", listProducts);
router.get("/:idOrSlug", getProduct);

router.post("/bulk-upload", requireAuth, uploadCsv.single("csvFile"), bulkUploadProducts);
router.post("/", requireAuth, uploadProductImages, createProduct);
router.put("/:idOrSlug", requireAuth, uploadProductImages, updateProduct);
router.delete("/:idOrSlug", requireAuth, deleteProduct);

export default router;
