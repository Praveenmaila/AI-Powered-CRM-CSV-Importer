import type { CRMRecord } from "./crm.types";

// ═══════════════════════════════════════════════
// Import Domain Types
// ═══════════════════════════════════════════════

/**
 * Raw parsed CSV data before AI processing.
 */
export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * A single batch of rows to send to Gemini.
 */
export interface RowBatch {
  batchIndex: number;
  rows: Record<string, string>[];
  startRowNumber: number;
}

/**
 * A row that was skipped during AI mapping, with reason.
 */
export interface SkippedRecord {
  row_number: number;
  original_data: Record<string, string>;
  reason: string;
}

/**
 * Result from a single Gemini batch call.
 */
export interface BatchResult {
  imported: CRMRecord[];
  skipped: SkippedRecord[];
}

/**
 * Aggregate statistics for the entire import operation.
 */
export interface ImportStatistics {
  total_rows: number;
  imported_count: number;
  skipped_count: number;
  batch_count: number;
  processing_time_ms: number;
}

/**
 * The final import response returned to the frontend.
 */
export interface ImportResponse {
  success: true;
  data: {
    imported: CRMRecord[];
    skipped: SkippedRecord[];
    statistics: ImportStatistics;
  };
}

/**
 * Error response shape.
 */
export interface ImportErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Known error codes for consistent error handling.
 */
export const ERROR_CODES = {
  NO_FILE: "NO_FILE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  EMPTY_CSV: "EMPTY_CSV",
  INVALID_CSV: "INVALID_CSV",
  GEMINI_ERROR: "GEMINI_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
