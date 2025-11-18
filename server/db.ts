import mysql from "mysql2/promise";
import dotenv from "dotenv";

// NOTE: In Vercel, environment variables are set via the dashboard, 
// so dotenv.config() is often not needed in production, but we keep it for local dev.
dotenv.config({ path: ".env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add connection timeout for robustness in serverless environment
  connectTimeout: 10000, // 10 seconds
});

export async function initializeDatabase() {
  try {
    // Check if essential DB variables are set before attempting connection
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_DATABASE) {
        console.warn("Database environment variables (DB_HOST, DB_USER, DB_DATABASE) are not fully set. Skipping table initialization.");
        return; // Skip initialization if not configured
    }

    const connection = await pool.getConnection();
    await connection.query(
      `CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        category ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
    connection.release();
    console.log("Database and 'articles' table initialized successfully.");
  } catch (error) {
    // Log the error object for better debugging in Vercel logs
    console.error("FATAL DATABASE INITIALIZATION ERROR:", error.message);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.log("Note: Database initialization failed. This is likely due to incorrect environment variables or database accessibility from Vercel.");
    // Allow the function to continue, but subsequent DB calls will fail.
  }
}

export default pool;
