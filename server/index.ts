import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeDatabase } from "./db.js";
import articleRouter from "./routes/article.js";

dotenv.config({ path: "./.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express app outside the startServer function
const app = express();

async function setupApp() {
  await initializeDatabase();
  app.use(express.json());

  // Serve static files from dist/public in production
  // NOTE: Vercel serverless functions do not serve static files. 
  // This part is likely only for local development/testing.
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // app.use(express.static(staticPath)); // Commented out for Vercel serverless

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
    // If adminAuth passes, the user is authenticated
    // In a real app, a JWT would be issued here. For simplicity, we'll just send a success message.
    res.json({ message: "Login successful" });
  });

  // Handle client-side routing - serve index.html for all routes
  // NOTE: This is for the frontend, which should be deployed separately.
  // The backend should only handle API routes.
  // app.get("*", (_req, res) => {
  //   res.sendFile(path.join(staticPath, "index.html"));
  // });
  
  // Add a simple root route for Vercel to check if the function is alive
  app.get("/", (_req, res) => {
    res.json({ status: "Backend API is running" });
  });
}

// Setup the app once
setupApp().catch(console.error);

// Export the app for Vercel's serverless function handler
export default app;

// The original server start logic for local development
if (process.env.NODE_ENV !== "production") {
  const server = createServer(app);
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
