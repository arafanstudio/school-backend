import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeDatabase } from "./db.js";
import articleRouter from "./routes/article.js";

// Load environment variables
dotenv.config({ path: "./.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express app immediately
const app = express();
app.use(express.json());

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// API Routes
app.use("/api/articles", articleRouter);

// Admin Login Route (POST)
app.post("/api/admin/login", adminAuth, (req, res) => {
  res.json({ message: "Login successful" });
});

// Add a simple root route for Vercel to check if the function is alive
app.get("/", (_req, res) => {
  res.json({ status: "Backend API is running" });
});

// The async setup (database initialization) is now handled outside the main app export
// and will run when the module is first loaded (cold start).
async function setupApp() {
  try {
    await initializeDatabase();
    console.log("Application setup complete.");
  } catch (error) {
    console.error("Fatal error during application setup:", error);
    // Log the error, but do not crash the process.
  }
}

// Run the setup function
setupApp();

// Export the app for Vercel's serverless function handler (via esbuild output)
// esbuild will generate a file that exports this 'app' instance.
export default app;

// The original server start logic for local development
if (process.env.NODE_ENV !== "production") {
  const server = createServer(app);
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
