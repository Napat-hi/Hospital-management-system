const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");

const router = express.Router();



const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin_user',
  password: process.env.DB_PASSWORD || 'AdminPassword123!',
  database: process.env.DB_NAME || 'HMS',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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

  try {
    // Query user table with decrypted username and salt
    const [userRows] = await pool.query(
      `SELECT user_id, 
              CAST(AES_DECRYPT(username, (SELECT enc_key FROM secret_config WHERE id=1)) AS CHAR(80)) AS username, 
              password,
              salt
       FROM user
       WHERE CAST(AES_DECRYPT(username, (SELECT enc_key FROM secret_config WHERE id=1)) AS CHAR(80)) = ?`,
      [username]
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      // Hash the provided password with the stored salt
      const hashedPasswordWithSalt = crypto.createHash("sha256").update(password + user.salt).digest("hex");
      
      if (hashedPasswordWithSalt !== user.password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Determine role by checking doctor and staff tables
      let role = null;
      let firstName = null;
      let lastName = null;

      // Check if user is a doctor
      const [doctorRows] = await pool.query(
        `SELECT first_name, last_name FROM doctor WHERE user_id = ?`,
        [user.user_id]
      );

      if (doctorRows.length > 0) {
        role = 'doctor';
        firstName = doctorRows[0].first_name;
        lastName = doctorRows[0].last_name;
      } else {
        // Check if user is staff
        const [staffRows] = await pool.query(
          `SELECT first_name, last_name FROM staff WHERE user_id = ?`,
          [user.user_id]
        );

        if (staffRows.length > 0) {
          role = 'staff';
          firstName = staffRows[0].first_name;
          lastName = staffRows[0].last_name;
        }
      }

      // Check if username is 'admin' for admin role
      if (user.username === 'admin') {
        role = 'admin';
        firstName = 'Admin';
        lastName = 'User';
      }

      if (!role) {
        return res.status(401).json({ error: "User role not found" });
      }

      const token = jwt.sign({ user_id: user.user_id, role: role }, process.env.JWT_SECRET || "DLWQ12", { expiresIn: "1h" });
      return res.json({ token, username: user.username, role: role, firstName: firstName, lastName: lastName });
    }

    res.status(401).json({ error: "Invalid username or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
