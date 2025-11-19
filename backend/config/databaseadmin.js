// Database connection configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool (better than single connection)
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

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Admin Database connection failed:', err.message);
    return;
  }
  console.log(' Admin Database connected successfully!');
  connection.release();
});

module.exports = pool;