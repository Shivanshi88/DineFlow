import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
dotenv.config(); // pehle env load

const app = express(); // <-- app initialize pehle

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://YOUR_FRONTEND_URL.vercel.app"
  ],
  credentials: true
}));


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ✅ Routes (app.use only AFTER app initialize)
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes); // <-- yahan sahi hai
app.use("/api/admin", adminRoutes);
// ✅ Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
