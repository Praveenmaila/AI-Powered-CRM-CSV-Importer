import { logger } from "./logger";

// ═══════════════════════════════════════════════
// Retry with Exponential Backoff
// ═══════════════════════════════════════════════

interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds (default: 200) */
  baseDelayMs: number;
  /** Label for logging purposes */
  label?: string;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 200,
  label: "operation",
};

/**
 * Sleeps for the specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates delay with exponential backoff and random jitter.
 *
 * Formula: baseDelay * 2^attempt + random(0, 100)ms
 *
 * Example with baseDelay=200:
 *   Attempt 0: 200–300ms
 *   Attempt 1: 400–500ms
 *   Attempt 2: 800–900ms
 */
function calculateDelay(attempt: number, baseDelayMs: number): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return exponentialDelay + jitter;
}

/**
 * Retries an async function with exponential backoff and jitter.
 *
 * - On success: returns the result immediately
 * - On failure: retries up to maxRetries times
 * - After all retries exhausted: throws the last error
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the successful function call
 * @throws The last error if all retries are exhausted
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        logger.info(
          `${config.label} succeeded on attempt ${attempt + 1}/${config.maxRetries + 1}`
        );
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries) {
        const delay = calculateDelay(attempt, config.baseDelayMs);
        logger.warn(
          `${config.label} failed (attempt ${attempt + 1}/${config.maxRetries + 1}). ` +
          `Retrying in ${Math.round(delay)}ms...`,
          { error: lastError.message }
        );
        await sleep(delay);
      } else {
        logger.error(
          `${config.label} failed after ${config.maxRetries + 1} attempts`,
          { error: lastError.message }
        );
      }
    }
  }

  throw lastError;
}
