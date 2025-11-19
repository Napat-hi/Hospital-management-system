const express = require("express");
const crypto = require("crypto");
const authenticateToken = require("./middleware/authMiddleware");

const router = express.Router();

// Utility: hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// GET /profile - Get current user's profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const db = require("./config/database");
    const [rows] = await db.query(
      `SELECT user_id, username, role, created_at 
       FROM user 
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /profile - Update current user's profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const db = require("./config/database");

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: "Invalid username" });
    }

    await db.query(
      "UPDATE user SET username = ? WHERE user_id = ?",
      [username.trim(), req.user.user_id]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /change-password - Change user password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = require("./config/database");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (newPassword.length < 3) {
      return res.status(400).json({ error: "Password must be at least 3 characters" });
    }

    // Verify current password
    const [rows] = await db.query(
      "SELECT password FROM user WHERE user_id = ?",
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedCurrentPassword = hashPassword(currentPassword);
    if (hashedCurrentPassword !== rows[0].password) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password
    const hashedNewPassword = hashPassword(newPassword);
    await db.query(
      "UPDATE user SET password = ? WHERE user_id = ?",
      [hashedNewPassword, req.user.user_id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /users - Get all users (Admin only)
router.get("/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: admin only" });
    }

    const db = require("./config/database");
    const [rows] = await db.query(
      `SELECT user_id, username, role, created_at 
       FROM user 
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /users - Create new user (Admin only)
router.post("/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: admin only" });
    }

    const { username, password, role } = req.body;
    const db = require("./config/database");

    if (!username || !password || !role) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 3) {
      return res.status(400).json({ error: "Password must be at least 3 characters" });
    }

    const validRoles = ["admin", "staff", "doctor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const hashedPassword = hashPassword(password);

    const [result] = await db.query(
      "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
      [username.trim(), hashedPassword, role]
    );

    res.status(201).json({
      message: "User created successfully",
      user_id: result.insertId
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username already exists" });
    }
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /users/:id - Delete user (Admin only)
router.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: admin only" });
    }

    const userId = parseInt(req.params.id);
    const db = require("./config/database");

    // Prevent deleting yourself
    if (userId === req.user.user_id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const [result] = await db.query(
      "DELETE FROM user WHERE user_id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;