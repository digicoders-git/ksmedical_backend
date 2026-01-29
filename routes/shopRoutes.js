import express from "express";
import { 
  createShop, 
  listShops, 
  getShop, 
  updateShop, 
  deleteShop,
  shopLogin
} from "../controllers/shopController.js";

const router = express.Router();

router.post("/login", shopLogin);
router.post("/", createShop);
router.get("/", listShops);
router.get("/:id", getShop);
router.put("/:id", updateShop);
router.delete("/:id", deleteShop);

export default router;
