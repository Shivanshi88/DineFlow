import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    items: [
      {
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "pending" }, // pending / completed
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
