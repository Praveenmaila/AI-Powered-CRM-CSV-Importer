import { z } from "zod";

// ═══════════════════════════════════════════════
// Client-Side Validators
// ═══════════════════════════════════════════════

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
];

/**
 * Validates a file for CSV upload requirements.
 */
export const fileSchema = z.object({
  name: z
    .string()
    .refine((name) => name.toLowerCase().endsWith(".csv"), {
      message: "Only .csv files are accepted",
    }),
  size: z
    .number()
    .max(MAX_FILE_SIZE, `File size must be under ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  type: z.string().refine(
    (type) => ACCEPTED_FILE_TYPES.includes(type) || type === "",
    { message: "Invalid file type. Please upload a CSV file." }
  ),
});

/**
 * Validates a file and returns errors if invalid.
 * Returns null if the file is valid.
 */
export function validateFile(file: File): string | null {
  // Check extension first (most reliable)
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return "Only .csv files are accepted. Please upload a valid CSV file.";
  }

  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`;
  }

  // Check if file is empty
  if (file.size === 0) {
    return "The file is empty. Please upload a CSV file with data.";
  }

  return null;
}
