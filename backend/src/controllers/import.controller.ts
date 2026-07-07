import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error-handler";
import { ERROR_CODES } from "../types/import.types";
import { env } from "../config/env";
import { parseCSV } from "../services/csv-parser.service";
import { splitIntoBatches } from "../services/batch.service";
import { mapBatches } from "../services/gemini.service";
import { mergeResults } from "../services/mapper.service";

// ═══════════════════════════════════════════════
// Import Controller
// ═══════════════════════════════════════════════

/**
 * Handles the CSV import request.
 *
 * Pipeline:
 * 1. Validate file exists
 * 2. Parse CSV from buffer
 * 3. Split rows into batches
 * 4. Send batches to Gemini AI
 * 5. Merge results and compute statistics
 * 6. Return structured response
 */
export async function importCSV(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();

  try {
    // ── Step 1: Validate file ──────────────────────
    if (!req.file) {
      throw new AppError(
        400,
        ERROR_CODES.NO_FILE,
        "No file was uploaded. Please attach a CSV file to the 'file' form field."
      );
    }

    logger.info(`File received: ${req.file.originalname} (${formatBytes(req.file.size)})`);

    // ── Step 2: Parse CSV ──────────────────────────
    let parsed;
    try {
      parsed = await parseCSV(req.file.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parsing error";

      // Determine specific error code
      if (message.includes("no data rows")) {
        throw new AppError(400, ERROR_CODES.EMPTY_CSV, "The CSV file contains no data rows.", message);
      }
      if (message.includes("no headers")) {
        throw new AppError(400, ERROR_CODES.INVALID_CSV, "The CSV file has no column headers.", message);
      }
      throw new AppError(400, ERROR_CODES.INVALID_CSV, "Failed to parse the CSV file.", message);
    }

    logger.info(
      `CSV parsed: ${parsed.headers.length} columns, ${parsed.rows.length} rows`
    );

    // ── Step 3: Split into batches ─────────────────
    const batches = splitIntoBatches(parsed.rows, env.BATCH_SIZE);

    // ── Step 4: Process with Gemini AI ─────────────
    logger.info("Starting Gemini AI processing...");
    const batchResults = await mapBatches(parsed.headers, batches);

    // ── Step 5: Merge results ──────────────────────
    const response = mergeResults(batchResults, parsed.rows.length, startTime);

    logger.info(
      `Import completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s — ` +
      `${response.data.statistics.imported_count} imported, ` +
      `${response.data.statistics.skipped_count} skipped`
    );

    // ── Step 6: Return response ────────────────────
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
