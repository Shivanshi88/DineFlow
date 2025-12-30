import express from "express";
import mongoose from "mongoose";
const router = express.Router();

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number,
  tableNumber: { type: Number, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// --------- CREATE ORDER ---------
router.post("/create", async (req, res) => {
  try {
    const { items, total, tableNumber } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "Cart is empty" });
    if (!tableNumber) return res.status(400).json({ message: "Table number is required" });

    const newOrder = new Order({ items, total, tableNumber });
    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------- GET ALL ORDERS ---------
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------- UPDATE ORDER STATUS ---------
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
