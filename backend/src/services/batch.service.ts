import { logger } from "../utils/logger";
import type { RowBatch } from "../types/import.types";

// ═══════════════════════════════════════════════
// Batch Service
// ═══════════════════════════════════════════════

/**
 * Splits an array of CSV rows into smaller batches for Gemini processing.
 *
 * Each batch stays within Gemini's token limits (~8K tokens for 25 rows)
 * while maximizing throughput by minimizing the number of API calls.
 *
 * @param rows - All parsed CSV rows
 * @param batchSize - Number of rows per batch (default: 25)
 * @returns Array of RowBatch objects with batch metadata
 */
export function splitIntoBatches(
  rows: Record<string, string>[],
  batchSize: number = 25
): RowBatch[] {
  if (rows.length === 0) {
    logger.warn("No rows to batch");
    return [];
  }

  if (batchSize < 1) {
    throw new Error("Batch size must be at least 1");
  }

  const batches: RowBatch[] = [];
  const totalBatches = Math.ceil(rows.length / batchSize);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batchRows = rows.slice(i, i + batchSize);
    batches.push({
      batchIndex: batches.length,
      rows: batchRows,
      startRowNumber: i + 1, // 1-based for human-readable row numbers
    });
  }

  logger.info(
    `Split ${rows.length} rows into ${totalBatches} batches of ~${batchSize} rows each`
  );

  return batches;
}
