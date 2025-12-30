import MenuItem from "../models/MenuItem.js";
import cloudinary from "../config/cloudinary.js";

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      { folder: "dineflow/menu" }
    );

    const menu = await MenuItem.create({
      name,
      description,
      price,
      category,
      image: result.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Menu item added",
      data: menu,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
