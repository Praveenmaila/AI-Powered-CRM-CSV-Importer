import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import importRoutes from "./routes/import.routes";

// ═══════════════════════════════════════════════
// Express Application Factory
// ═══════════════════════════════════════════════

const app = express();

// ── Global Middleware ─────────────────────────
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────
app.use((req, _res, next) => {
  if (req.path !== "/api/health") {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[90m[${timestamp}]\x1b[0m ${req.method} ${req.path}`);
  }
  next();
});

// ── Routes ────────────────────────────────────

/**
 * Health check endpoint for deployment monitoring.
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "ai-csv-importer-backend",
  });
});

/**
 * Import route — POST /api/import
 */
app.use("/api/import", importRoutes);

// ── 404 Handler ───────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
});

// ── Global Error Handler (must be last) ───────
app.use(errorHandler);

export default app;
