import { logger } from "../utils/logger";
import type {
  BatchResult,
  ImportResponse,
  ImportStatistics,
} from "../types/import.types";
import type { CRMRecord } from "../types/crm.types";
import type { SkippedRecord } from "../types/import.types";

// ═══════════════════════════════════════════════
// Mapper Service — Response Merger & Statistics
// ═══════════════════════════════════════════════

/**
 * Merges results from all Gemini batch calls into a single
 * ImportResponse with aggregate statistics.
 *
 * @param batchResults - Array of results from each batch
 * @param totalRows - Total row count from the original CSV
 * @param startTime - Timestamp when processing started (for duration calc)
 * @returns Complete ImportResponse ready to send to frontend
 */
export function mergeResults(
  batchResults: BatchResult[],
  totalRows: number,
  startTime: number
): ImportResponse {
  const allImported: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  // Flatten all batch results
  for (const batch of batchResults) {
    allImported.push(...batch.imported);
    allSkipped.push(...batch.skipped);
  }

  // Compute processing duration
  const processingTimeMs = Date.now() - startTime;

  // Build statistics
  const statistics: ImportStatistics = {
    total_rows: totalRows,
    imported_count: allImported.length,
    skipped_count: allSkipped.length,
    batch_count: batchResults.length,
    processing_time_ms: processingTimeMs,
  };

  logger.info("Import results merged", {
    total: statistics.total_rows,
    imported: statistics.imported_count,
    skipped: statistics.skipped_count,
    batches: statistics.batch_count,
    duration: `${(statistics.processing_time_ms / 1000).toFixed(1)}s`,
  });

  // Warn if numbers don't add up (possible Gemini inconsistency)
  const processedCount = statistics.imported_count + statistics.skipped_count;
  if (processedCount !== totalRows) {
    logger.warn(
      `Row count mismatch: total=${totalRows}, imported+skipped=${processedCount}. ` +
      `Gemini may have merged or dropped ${totalRows - processedCount} rows.`
    );
  }

  return {
    success: true,
    data: {
      imported: allImported,
      skipped: allSkipped,
      statistics,
    },
  };
}
