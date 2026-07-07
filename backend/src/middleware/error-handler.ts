import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { logger } from "../utils/logger";
import type { ImportErrorResponse, ErrorCode } from "../types/import.types";
import { ERROR_CODES } from "../types/import.types";

// ═══════════════════════════════════════════════
// Application Error Class
// ═══════════════════════════════════════════════

/**
 * Custom error class with HTTP status code and error code
 * for consistent error responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: string;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// ═══════════════════════════════════════════════
// Global Error Handler Middleware
// ═══════════════════════════════════════════════

/**
 * Express global error handler — must be registered LAST.
 * Maps known error types to proper HTTP responses.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Multer errors (file upload issues) ──────────
  if (err instanceof MulterError) {
    const multerResponse = handleMulterError(err);
    logger.warn("Multer upload error", { code: err.code, message: err.message });
    res.status(multerResponse.statusCode).json(multerResponse.body);
    return;
  }

  // ── Known application errors ────────────────────
  if (err instanceof AppError) {
    logger.warn(`Application error: ${err.code}`, { message: err.message });
    const body: ImportErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Multer file filter errors (thrown as generic Error) ──
  if (err.message && err.message.includes("Invalid file type")) {
    logger.warn("File type validation failed", { message: err.message });
    const body: ImportErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.INVALID_FILE_TYPE,
        message: "The uploaded file is not a valid CSV. Please upload a .csv file.",
        details: err.message,
      },
    };
    res.status(400).json(body);
    return;
  }

  // ── Unknown errors (500) ────────────────────────
  logger.error("Unhandled error", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  const body: ImportErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "An unexpected error occurred. Please try again.",
      details:
        process.env.NODE_ENV !== "production" ? err.message : undefined,
    },
  };

  res.status(500).json(body);
}

// ═══════════════════════════════════════════════
// Multer Error Mapping
// ═══════════════════════════════════════════════

function handleMulterError(err: MulterError): {
  statusCode: number;
  body: ImportErrorResponse;
} {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return {
        statusCode: 400,
        body: {
          success: false,
          error: {
            code: ERROR_CODES.FILE_TOO_LARGE,
            message: "File size exceeds the 10MB limit. Please upload a smaller CSV.",
            details: `Multer error code: ${err.code}`,
          },
        },
      };

    case "LIMIT_UNEXPECTED_FILE":
      return {
        statusCode: 400,
        body: {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_FILE_TYPE,
            message: 'Please upload the file using the "file" form field.',
            details: `Expected field name: "file", received: "${err.field}"`,
          },
        },
      };

    default:
      return {
        statusCode: 400,
        body: {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_ERROR,
            message: "File upload failed. Please try again.",
            details: err.message,
          },
        },
      };
  }
}
