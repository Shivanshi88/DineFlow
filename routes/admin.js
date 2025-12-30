// routes/admin.js
import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret";

// ✅ Check if admin exists (for frontend)
router.get("/check", async (req, res) => {
  const admin = await Admin.findOne({ role: "admin" });
  res.json({ exists: !!admin });
});

// ✅ Create admin (single admin)
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Admin.findOne({ role: "admin" });
     console.log("Existing admin:", existing);
    if (existing) return res.status(400).json({ message: "Admin already exists" });


    const admin = await Admin.create({ name, email, password, role: "admin" });
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
