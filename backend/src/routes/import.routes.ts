import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload";
import { importCSV } from "../controllers/import.controller";

// ═══════════════════════════════════════════════
// Import Routes
// ═══════════════════════════════════════════════

const router = Router();

/**
 * POST /api/import
 *
 * Upload a CSV file for AI-powered CRM mapping.
 *
 * Content-Type: multipart/form-data
 * Body: file (CSV, max 10MB)
 *
 * Returns: { success: true, data: { imported[], skipped[], statistics } }
 */
router.post("/", uploadMiddleware, importCSV);

export default router;
