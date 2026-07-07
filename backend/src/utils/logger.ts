// ═══════════════════════════════════════════════
// Structured Logger
// ═══════════════════════════════════════════════

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

/**
 * Formats a log entry based on the current environment.
 * - Development: Human-readable colored output
 * - Production: JSON for log aggregation services
 */
function formatLog(entry: LogEntry): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return JSON.stringify(entry);
  }

  const colors: Record<LogLevel, string> = {
    INFO: "\x1b[36m",   // Cyan
    WARN: "\x1b[33m",   // Yellow
    ERROR: "\x1b[31m",  // Red
    DEBUG: "\x1b[90m",  // Gray
  };
  const reset = "\x1b[0m";
  const color = colors[entry.level];

  const dataStr = entry.data !== undefined
    ? ` ${JSON.stringify(entry.data, null, 2)}`
    : "";

  return `${color}[${entry.timestamp}] [${entry.level}]${reset} ${entry.message}${dataStr}`;
}

function createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
}

/**
 * Structured logger with colored output in development
 * and JSON output in production.
 */
export const logger = {
  info(message: string, data?: unknown): void {
    console.log(formatLog(createEntry("INFO", message, data)));
  },

  warn(message: string, data?: unknown): void {
    console.warn(formatLog(createEntry("WARN", message, data)));
  },

  error(message: string, data?: unknown): void {
    console.error(formatLog(createEntry("ERROR", message, data)));
  },

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog(createEntry("DEBUG", message, data)));
    }
  },
};
