// controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { cloudinary } from "../config/cloudinary.js";
import csv from "csv-parser";
import { Readable } from "stream";

const parseMaybeJSON = (value, fallback) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return fallback;
  }
};

// CREATE
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price, // Map to sellingPrice
      sellingPrice,
      mrp,
      purchasePrice,
      margin,
      stock,
      unit,
      manufacturer,
      batchNo,
      expiryDate,
      prescriptionRequired,
      gst,
      discountPercent,
      sizes,
      colors,
      addOns,
      description,
      about,
      categoryId,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res
        .status(400)
        .json({ message: "name, price, categoryId required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    if (!req.files || !req.files.mainImage || !req.files.mainImage[0]) {
      return res.status(400).json({ message: "Main Image is required" });
    }

    const mainImageFile = req.files.mainImage[0];
    const galleryFiles = req.files.galleryImages || [];

    const galleryImages = galleryFiles.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const parsedSizes = parseMaybeJSON(sizes, []);
    const parsedColors = parseMaybeJSON(colors, []);
    const parsedAddOns = parseMaybeJSON(addOns, []);

    const product = await Product.create({
      name,
      category: category._id,
      price: Number(sellingPrice || price), 
      sellingPrice: Number(sellingPrice || price),
      mrp: Number(mrp || 0),
      purchasePrice: Number(purchasePrice || 0),
      margin: Number(margin || 0),
      stock: Number(stock || 0),
      unit: unit || "Pcs",
      manufacturer: manufacturer || "",
      batchNo: batchNo || "",
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      prescriptionRequired: prescriptionRequired === "true" || prescriptionRequired === true,
      gst: Number(gst || 0),
      discountPercent: Number(discountPercent || 0),
      mainImage: {
        url: mainImageFile.path,
        publicId: mainImageFile.filename,
      },
      galleryImages,
      sizes: parsedSizes,
      colors: parsedColors,
      addOns: parsedAddOns,
      description,
      about,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LIST
export const listProducts = async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ONE
export const getProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product =
      (await Product.findOne({ slug: idOrSlug }).populate(
        "category",
        "name slug"
      )) ||
      (await Product.findById(idOrSlug).populate("category", "name slug"));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let product =
      (await Product.findOne({ slug: idOrSlug })) ||
      (await Product.findById(idOrSlug));

    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      price,
      sellingPrice,
      mrp,
      purchasePrice,
      margin,
      stock,
      unit,
      manufacturer,
      batchNo,
      expiryDate,
      prescriptionRequired,
      gst,
      discountPercent,
      sizes,
      colors,
      addOns,
      description,
      about,
      categoryId,
      isActive,
    } = req.body;

    if (name) {
      product.name = name;
      product.slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") +
        "-" +
        Date.now();
    }

    const finalSellingPrice = sellingPrice || price;
    if (finalSellingPrice) {
        product.price = Number(finalSellingPrice);
        product.sellingPrice = Number(finalSellingPrice);
    }
    
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (purchasePrice !== undefined) product.purchasePrice = Number(purchasePrice);
    if (margin !== undefined) product.margin = Number(margin);
    if (stock !== undefined) product.stock = Number(stock);
    if (unit !== undefined) product.unit = unit;
    if (manufacturer !== undefined) product.manufacturer = manufacturer;
    if (batchNo !== undefined) product.batchNo = batchNo;
    if (expiryDate !== undefined) product.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (prescriptionRequired !== undefined) product.prescriptionRequired = prescriptionRequired === "true" || prescriptionRequired === true;
    if (gst !== undefined) product.gst = Number(gst);
    
    if (discountPercent !== undefined)
      product.discountPercent = Number(discountPercent);

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid categoryId" });
      }
      product.category = category._id;
    }

    if (sizes) product.sizes = parseMaybeJSON(sizes, []);
    if (colors) product.colors = parseMaybeJSON(colors, []);
    if (addOns) product.addOns = parseMaybeJSON(addOns, []);
    if (description !== undefined) product.description = description;
    if (about !== undefined) product.about = about;
    if (isActive !== undefined) product.isActive = !!isActive;

    if (req.files?.mainImage?.[0]) {
      await cloudinary.uploader.destroy(product.mainImage.publicId);
      const file = req.files.mainImage[0];
      product.mainImage = { url: file.path, publicId: file.filename };
    }

    if (req.files?.galleryImages) {
      for (let img of product.galleryImages) {
        await cloudinary.uploader.destroy(img.publicId);
      }
      const galleryFiles = req.files.galleryImages;
      product.galleryImages = galleryFiles.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    await product.save();
    res.json({ message: "Product updated", product });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product =
      (await Product.findOne({ slug: idOrSlug })) ||
      (await Product.findById(idOrSlug));
    if (!product) return res.status(404).json({ message: "Product not found" });

    await cloudinary.uploader.destroy(product.mainImage.publicId);
    for (let img of product.galleryImages) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// BULK UPLOAD
export const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          let addedCount = 0;
          let skippedCount = 0;
          const errors = [];

          // Pre-fetch categories for mapping
          const categories = await Category.find({});
          const categoryMap = {}; // Name -> ID
          categories.forEach((c) => {
            categoryMap[c.name.toLowerCase()] = c._id;
          });
          
          // Get a default category if any, or create one
          let defaultCategory = categories[0]?._id;
           if(!defaultCategory) {
               const newCat = await Category.create({ name: "General", slug: "general" });
               defaultCategory = newCat._id;
               categoryMap["general"] = newCat._id;
           }

          for (const row of results) {
             // Normalize keys (trim spaces, lowercase)
             const cleanRow = {};
             Object.keys(row).forEach(key => {
                 cleanRow[key.trim().toLowerCase()] = row[key]?.trim();
             });
             
             const name = cleanRow["name"] || cleanRow["product name"];
             if (!name) {
                 skippedCount++;
                 continue;
             }
             
             const price = parseFloat(cleanRow["price"] || cleanRow["selling price"] || "0");
             const purchasePrice = parseFloat(cleanRow["purchase price"] || "0");
             const mrp = parseFloat(cleanRow["mrp"] || "0");
             const stock = parseInt(cleanRow["stock"] || cleanRow["stock qty"] || "0");
             
             // Category handling
             let categoryId = defaultCategory;
             const catName = (cleanRow["category"] || "").toLowerCase();
             if(catName && categoryMap[catName]) {
                 categoryId = categoryMap[catName];
             }
             
             try {
                await Product.create({
                    name,
                    category: categoryId,
                    sellingPrice: price || 0,
                    price: price || 0, // Fallback
                    purchasePrice,
                    mrp,
                    stock,
                    unit: cleanRow["unit"] || "Pcs",
                    manufacturer: cleanRow["manufacturer"] || "",
                    batchNo: cleanRow["batch no"] || cleanRow["batchno"] || "",
                    expiryDate: cleanRow["expiry date"] ? new Date(cleanRow["expiry date"]) : undefined,
                    description: cleanRow["description"] || "",
                    prescriptionRequired: cleanRow["prescription required"] === "yes" || cleanRow["prescription required"] === "true",
                    gst: parseFloat(cleanRow["gst"] || "0"),
                    margin: 0,
                    mainImage: {
                        url: cleanRow["image url"] || "https://placehold.co/400", 
                        publicId: "placeholder_" + Date.now() 
                    },
                    isActive: true
                });
                addedCount++;
             } catch (e) {
                 skippedCount++;
                 errors.push(`Error adding ${name}: ${e.message}`);
             }
          }

          res.json({
            message: `Processed CSV. Added: ${addedCount}, Skipped/Failed: ${skippedCount}`,
            errors: errors.slice(0, 10)
          });
        } catch (err) {
          console.error("Bulk process error:", err);
          res.status(500).json({ message: "Error processing CSV data", error: err.message });
        }
      });
  } catch (err) {
    console.error("bulkUploadProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
