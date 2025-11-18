import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

let connection = null;

// Membuat koneksi global agar tidak membuat koneksi baru setiap request
async function getDB() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306,
    });

    console.log("Connected to MySQL database");
  }

  return connection;
}

export async function initializeDatabase() {
  try {
    const db = await getDB();

    await db.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        category ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Table 'articles' initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
}

export default getDB;
