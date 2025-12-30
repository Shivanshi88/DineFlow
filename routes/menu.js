import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import MenuItem from "../models/MenuItem.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// --------- ADD NEW ITEM ---------
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!name || !category || !price)
      return res.status(400).json({ message: "Name, category, and price are required" });

    const streamUpload = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "DineFlow/Menu" },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        stream.end(fileBuffer);
      });

    const result = await streamUpload(req.file.buffer);

    const newMenu = new MenuItem({
      name,
      category,
      price,
      description,
      image: result.secure_url,
    });

    await newMenu.save();

    res.status(200).json({ message: "Menu item added successfully", menu: newMenu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- GET ALL ITEMS ---------
router.get("/", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- UPDATE ITEM ---------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let updatedData = { name, category, price, description };

    if (req.file) {
      const streamUpload = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "DineFlow/Menu" },
            (error, result) => (result ? resolve(result) : reject(error))
          );
          stream.end(req.file.buffer);
        });

      const result = await streamUpload(req.file.buffer);
      updatedData.image = result.secure_url;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.status(200).json({ message: "Menu item updated successfully", menu: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- DELETE ITEM ---------
router.delete("/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
