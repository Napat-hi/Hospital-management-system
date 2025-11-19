// Database connection configuration
const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool (better than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'doctor_user',
  password: process.env.DB_PASSWORD || 'DoctorPassword123!',
  database: process.env.DB_NAME || 'HMS',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Doctor Database connection failed:', err.message);
    return;
  }
  console.log(' Doctor Database connected successfully!');
  connection.release();
});

// Export promise-based pool for async/await
module.exports = pool.promise();
