// ═══════════════════════════════════════════════
// CSV Domain Types (Frontend)
// ═══════════════════════════════════════════════

/**
 * Represents a single row of CSV data as key-value pairs.
 * Keys are the CSV column headers.
 */
export type CSVRow = Record<string, string>;

/**
 * Metadata about the parsed CSV file.
 */
export interface CSVMeta {
  delimiter: string;
  linebreak: string;
  truncated: boolean;
}

/**
 * Result of client-side CSV parsing via PapaParse.
 */
export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
  meta: CSVMeta;
  rowCount: number;
  columnCount: number;
}

/**
 * File information displayed to the user after selection.
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}
