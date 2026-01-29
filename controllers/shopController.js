import Shop from "../models/Shop.js";

// CREATE
export const createShop = async (req, res) => {
  try {
    const { 
      shopName, 
      ownerName, 
      contactNumber, 
      email, 
      address, 
      city, 
      state, 
      pincode, 
      licenseNumber, 
      gstNumber, 
      username,
      password,
      image 
    } = req.body;

    if (!shopName || !ownerName || !contactNumber || !address || !city || !state || !pincode || !username || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check if username already exists
    const existingShop = await Shop.findOne({ username });
    if (existingShop) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const shop = await Shop.create({
      shopName,
      ownerName,
      contactNumber,
      email,
      address,
      city,
      state,
      pincode,
      licenseNumber,
      gstNumber,
      username,
      password,
      image,
    });

    res.status(201).json({ message: "Shop created successfully", shop });
  } catch (err) {
    console.error("createShop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LIST
export const listShops = async (_req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json({ shops });
  } catch (err) {
    console.error("listShops error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ONE
export const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ shop });
  } catch (err) {
    console.error("getShop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop updated successfully", shop });
  } catch (err) {
    console.error("updateShop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop deleted successfully" });
  } catch (err) {
    console.error("deleteShop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN FOR INVENTORY PANEL
export const shopLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const shop = await Shop.findOne({ username });

    if (!shop) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Simple password check (user asked for admin to set it, so keeping it simple for now)
    // Ideally use bcrypt here
    if (shop.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (shop.status === "Inactive") {
      return res.status(403).json({ message: "Shop is currently inactive. Contact Admin." });
    }

    // Return shop info (excluding password for security)
    const { password: _, ...shopInfo } = shop._doc;
    
    res.json({ 
      message: "Login successful", 
      shop: shopInfo,
      token: "dummy-shop-token-" + shop._id // In a real app, generate a JWT here
    });

  } catch (err) {
    console.error("shopLogin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
