import csvParser from "csv-parser";
import { Readable } from "stream";
import { logger } from "../utils/logger";
import type { ParsedCSV } from "../types/import.types";

// ═══════════════════════════════════════════════
// CSV Parser Service
// ═══════════════════════════════════════════════

/**
 * Parses a CSV file buffer into structured data using stream-based
 * csv-parser for memory efficiency.
 *
 * @param buffer - Raw file buffer from Multer
 * @returns Parsed CSV with headers and rows
 * @throws Error if CSV is malformed or empty
 */
export async function parseCSV(buffer: Buffer): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    let headers: string[] = [];

    // Remove BOM (Byte Order Mark) if present
    // Some Excel exports prepend \uFEFF to the file
    let csvString = buffer.toString("utf-8");
    if (csvString.charCodeAt(0) === 0xfeff) {
      csvString = csvString.slice(1);
      logger.debug("Removed BOM from CSV file");
    }

    const stream = Readable.from(csvString);

    stream
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => (typeof value === "string" ? value.trim() : value),
        })
      )
      .on("headers", (parsedHeaders: string[]) => {
        headers = parsedHeaders.filter((h) => h.length > 0);
        logger.debug(`CSV headers detected: [${headers.join(", ")}]`);
      })
      .on("data", (row: Record<string, string>) => {
        // Skip completely empty rows
        const hasData = Object.values(row).some(
          (val) => val !== undefined && val !== null && String(val).trim() !== ""
        );
        if (hasData) {
          rows.push(row);
        }
      })
      .on("end", () => {
        if (headers.length === 0) {
          reject(new Error("CSV file has no headers"));
          return;
        }

        if (rows.length === 0) {
          reject(new Error("CSV file has no data rows"));
          return;
        }

        logger.info(
          `CSV parsed successfully: ${headers.length} columns, ${rows.length} rows`
        );

        resolve({ headers, rows });
      })
      .on("error", (error) => {
        logger.error("CSV parsing error", { error: error.message });
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      });
  });
}
