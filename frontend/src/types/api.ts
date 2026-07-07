// ═══════════════════════════════════════════════
// API Types (Frontend)
// ═══════════════════════════════════════════════

import type { CRMRecord } from "./crm";

/**
 * A row that was skipped during AI mapping.
 */
export interface SkippedRecord {
  row_number: number;
  original_data: Record<string, string>;
  reason: string;
}

/**
 * Import statistics returned by the backend.
 */
export interface ImportStatistics {
  total_rows: number;
  imported_count: number;
  skipped_count: number;
  batch_count: number;
  processing_time_ms: number;
}

/**
 * Successful import response from the backend.
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
 * Error response from the backend.
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
 * Union type for all API responses.
 */
export type APIResponse = ImportResponse | ImportErrorResponse;

/**
 * Import process states.
 */
export type ImportStatus = "idle" | "uploading" | "processing" | "success" | "error";
