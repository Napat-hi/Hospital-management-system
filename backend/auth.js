const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");

const router = express.Router();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",        // update if needed
  password: "root",    // update if needed
  database: "HMS",
  port: 3306           // ensure matches your MAMP/MySQL port
});

// Utility: hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password);

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, password, role
       FROM user
       WHERE username = ?`,
      [username]
    );

    console.log("DB rows:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const hashedInput = hashPassword(password);
    console.log("Hashed input:", hashedInput, "Stored:", user.password);

    if (hashedInput !== user.password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );

    // ✅ Return token + user info
    res.json({
      token,
      user_id: user.user_id,
      username: user.username.toString(),
      role: user.role
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /staff/dashboard - Protected route
router.get("/staff/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: `Welcome staff user ${req.user.user_id}`,
    role: req.user.role
  });
});

// GET /staff/patients - Protected route to fetch patient data
router.get("/staff/patients", authenticateToken, async (req, res) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied: staff only" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT patient_id, name, age, condition FROM patients"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patients:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
