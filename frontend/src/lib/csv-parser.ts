import Papa from "papaparse";
import type { ParsedCSV, CSVRow } from "@/types/csv";

// ═══════════════════════════════════════════════
// PapaParse Client-Side CSV Parser
// ═══════════════════════════════════════════════

/**
 * Parses a CSV file on the client side using PapaParse.
 * Used for the preview step — no network call needed.
 *
 * Features:
 * - Auto-detects delimiter (comma, tab, semicolon, pipe)
 * - Handles quoted fields and escaped characters
 * - Trims whitespace from headers and values
 * - Filters out completely empty rows
 * - Limits preview to first 1000 rows for performance
 *
 * @param file - The CSV File object from the file input
 * @returns Parsed CSV data with headers, rows, and metadata
 */
export function parseCSVFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      preview: 1000, // Limit to 1000 rows for client-side preview
      complete: (results) => {
        const headers = results.meta.fields ?? [];

        if (headers.length === 0) {
          reject(new Error("CSV file has no column headers."));
          return;
        }

        // Filter out rows where all values are empty
        const rows = results.data.filter((row) =>
          Object.values(row).some((val) => val !== undefined && val !== null && String(val).trim() !== "")
        );

        if (rows.length === 0) {
          reject(new Error("CSV file has no data rows."));
          return;
        }

        resolve({
          headers,
          rows,
          meta: {
            delimiter: results.meta.delimiter,
            linebreak: results.meta.linebreak,
            truncated: results.meta.truncated ?? false,
          },
          rowCount: rows.length,
          columnCount: headers.length,
        });
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}
