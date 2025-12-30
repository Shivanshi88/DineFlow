import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: [true, "Price is required"] },
    image: { type: String, required: [true, "Image is required"] },
    category: { type: String, required: [true, "Category is required"], trim: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
