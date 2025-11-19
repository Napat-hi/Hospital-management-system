const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");

const router = express.Router();

// MySQL pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "HMS",
  port: 3306
});

// Hash password utility
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  // Demo users
  const demoUsers = {
    admin: { password: "admin", role: "admin", firstName: "Admin", lastName: "User" },
    staff: { password: "staff", role: "staff", firstName: "Staff", lastName: "User" },
    doctor: { password: "doctor", role: "doctor", firstName: "Doctor", lastName: "User" },
  };

  const demoUser = demoUsers[username];
  if (demoUser && demoUser.password === password) {
    const token = jwt.sign(
      { username, role: demoUser.role },
      process.env.JWT_SECRET || "DLWQ12",
      { expiresIn: "1h" }
    );
    return res.json({ token, username, role: demoUser.role, firstName: demoUser.firstName, lastName: demoUser.lastName });
  }

  try {
    // Query user table with decrypted username
    const [userRows] = await pool.query(
      `SELECT user_id, 
              CAST(AES_DECRYPT(username, (SELECT enc_key FROM secret_config WHERE id=1)) AS CHAR(80)) AS username, 
              password, role
       FROM user
       WHERE CAST(AES_DECRYPT(username, (SELECT enc_key FROM secret_config WHERE id=1)) AS CHAR(80)) = ?`,
      [username]
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      if (hashPassword(password) !== user.password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET || "DLWQ12", { expiresIn: "1h" });
      return res.json({ token, username: user.username, role: user.role });
    }

    res.status(401).json({ error: "Invalid username or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
