// backend/routes/admin.js
import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { verifyAdmin } from "../middlewares/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret";

/* ================================
   CHECK IF ADMIN EXISTS
================================ */
router.get("/check", async (req, res) => {
  try {
    const admin = await Admin.findOne({ role: "admin" });
    res.json({ exists: !!admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================================
   SIGNUP (ONLY IF NO ADMIN EXISTS)
================================ */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ role: "admin" });
    if (existing) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    // Password hashing handled by schema pre-save
    const admin = await Admin.create({
      name,
      email,
      password,  // plain password, schema will hash it
      role: "admin",
    });

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================================
   LOGIN
================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Entered password:", password);
    console.log("Password hash in DB:", admin.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   FORGOT PASSWORD – PRODUCTION READY
================================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    // ✅ Use FRONTEND_URL from environment
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${FRONTEND_URL}/admin/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      to: admin.email,
      subject: "Password Reset Link",
      text: `Click here to reset your password: ${resetLink}`,
      html: `<p>Click here to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================================
   RESET PASSWORD
================================ */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    res.json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   PROTECTED DASHBOARD
================================ */
router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin",
    adminId: req.admin.id,
  });
});

export default router;
