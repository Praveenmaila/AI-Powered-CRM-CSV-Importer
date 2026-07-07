import cors from "cors";
import { env } from "../config/env";

// ═══════════════════════════════════════════════
// CORS Middleware
// ═══════════════════════════════════════════════

/**
 * Configures CORS to allow requests from the frontend origin.
 * In development: defaults to http://localhost:3000
 * In production: set via CORS_ORIGIN env var to your Vercel URL
 */
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
});
