import mysql from "mysql2/promise";
import dotenv from "dotenv";

// NOTE: In Vercel, environment variables are set via the dashboard, 
// so dotenv.config() is often not needed in production, but we keep it for local dev.
dotenv.config({ path: ".env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST, // Removed default 'localhost'
  user: process.env.DB_USER, // Removed default 'root'
  password: process.env.DB_PASSWORD, // Removed default ''
  database: process.env.DB_DATABASE, // Removed default 'school_db'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    console.error("Error initializing database:", error);
    // In a serverless environment, process.exit(1) will crash the function.
    // We log the error but allow the function to continue, as the error might be 
    // a transient connection issue or the table already exists.
    // The actual API routes will fail later if the connection is truly broken.
    console.log("Note: Database initialization failed. Check your DB connection settings in Vercel.");
    // Removed process.exit(1);
  }
}

export default pool;
