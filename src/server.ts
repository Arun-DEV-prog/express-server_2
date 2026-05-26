
import app from "./app.js";
import { config } from "./config/config.js";
import { initDB } from "./DB/index.js";

// Store initialization state
let dbInitialized = false;

// Lazy initialize database on first request
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (err) {
      console.error("Database initialization error:", err);
      return res.status(500).json({ success: false, message: "Database connection failed" });
    }
  }
  next();
});

// Export app for Vercel serverless
export default app;

// Only listen locally during development
if (process.env.NODE_ENV !== "production") {
     app.listen(config.port, () => {
         console.log(`server running on port ${config.port}`);
     });
}