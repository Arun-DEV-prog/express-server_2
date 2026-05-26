
import express, { type Application, type Request, type Response } from "express"
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import authRoutes from  "./api/routes/auth.route.js"
import issueRoutes from "./api/routes/issues.route.js"
const app: Application =express()

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Health check endpoint (for Vercel monitoring)
app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main endpoint
app.get("/", (req: Request, res: Response) => {
    res.send("Server is Running")
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api", issueRoutes)

// Error handling middleware
app.use(globalErrorHandler)

export default app;