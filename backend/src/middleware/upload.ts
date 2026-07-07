import multer from "multer";
import type { Request } from "express";

// ═══════════════════════════════════════════════
// Multer File Upload Middleware
// ═══════════════════════════════════════════════

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Filters uploaded files to accept only CSVs.
 * Checks both MIME type and file extension as a safeguard.
 */
function csvFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  const allowedMimeTypes = [
    "text/csv",
    "text/plain",
    "application/csv",
    "application/vnd.ms-excel", // Some systems report .csv as Excel
  ];

  const hasValidMime = allowedMimeTypes.includes(file.mimetype);
  const hasValidExtension = file.originalname.toLowerCase().endsWith(".csv");

  if (hasValidMime || hasValidExtension) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type: ${file.mimetype}. Only CSV files are accepted.`
      )
    );
  }
}

/**
 * Multer configured for memory storage (no disk writes).
 * The file buffer is available at req.file.buffer.
 *
 * - Storage: memory (stateless, no temp files)
 * - Max size: 10MB
 * - File filter: CSV only
 * - Single file field: "file"
 */
const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: csvFileFilter,
});

/**
 * Express middleware that handles a single file upload
 * on the "file" form field.
 */
export const uploadMiddleware = multerInstance.single("file");
