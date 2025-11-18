import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeDatabase } from "./db";
import cors from "cors";
import articleRouter from "./routes/article";

dotenv.config({ path: "./.env" });

async function startServer() {
  const app = express();
  app.use(express.json());
  await initializeDatabase();
  app.use(cors({
    origin: process.env.FRONTEND_URL || "https://school-frontend-opal.vercel.app",
    credentials: true,
  }));

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

  //   // Admin Authentication Middleware for HTML pages
  const adminPageAuth = (req, res, next) => {
    if (req.url === '/' || req.url === '/index.html') {
        // Check if authenticated for the root page
        // NOTE: Vercel serverless functions don't maintain session/cookie state easily.
        // The HTML pages will use sessionStorage/localStorage and redirect.
        // For the backend root, we will just serve the login page by default,
        // and the HTML's JS will handle the redirect if authenticated.
        // This is a simpler approach for a Vercel serverless function.
        if (req.headers.cookie && req.headers.cookie.includes('isAdminAuthenticated=true')) {
            // If authenticated, serve the article creation page
            return res.sendFile(path.join(__dirname, 'ArticleCreation.html'));
        } else {
            // If not authenticated, serve the login page
            return res.sendFile(path.join(__dirname, 'AdminLogin.html'));
        }
    }
    // For other routes, proceed to the next middleware/route handler
    next();
  };

  // Admin Login Route (GET) - serves the login page
  app.get("/admin/login", (req, res) => {
      res.sendFile(path.join(__dirname, 'AdminLogin.html'));
  });

  // Admin Article Creation Route (GET) - serves the article creation page
  app.get("/admin/create-article", (req, res) => {
      res.sendFile(path.join(__dirname, 'ArticleCreation.html'));
  });

  // Use the adminPageAuth middleware for the root path
  app.get('/', adminPageAuth);

  // Fallback route for health check or simple message
  app.get("/health", (req, res) => {
    res.status(200).send("Backend API is running!");
  });

  // Export the app for Vercel serverless function
  return app;
}



// Vercel serverless function entry point
let appPromise;
export default async (req, res) => {
  if (!appPromise) {
    appPromise = startServer();
  }
  const app = await appPromise;
  app(req, res);
};
