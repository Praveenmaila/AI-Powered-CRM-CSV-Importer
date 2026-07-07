import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { retryAsync } from "../utils/retry";
import { buildMappingPrompt, SYSTEM_INSTRUCTION } from "../prompts/mapping.prompt";
import { batchResponseSchema } from "../schemas/import.schema";
import type { RowBatch, BatchResult, SkippedRecord } from "../types/import.types";

// ═══════════════════════════════════════════════
// Gemini AI Service
// ═══════════════════════════════════════════════

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Processes all batches through Gemini AI sequentially.
 * Each batch is retried independently on failure.
 * Failed batches result in all their rows being marked as skipped.
 *
 * @param headers - Original CSV column headers
 * @param batches - Array of row batches to process
 * @returns Array of batch results (imported + skipped records per batch)
 */
export async function mapBatches(
  headers: string[],
  batches: RowBatch[]
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const totalBatches = batches.length;

  logger.info(`Starting Gemini AI mapping: ${totalBatches} batches to process`);

  for (const batch of batches) {
    const batchLabel = `Batch ${batch.batchIndex + 1}/${totalBatches}`;

    try {
      const result = await retryAsync(
        () => processSingleBatch(headers, batch, totalBatches),
        {
          maxRetries: env.MAX_RETRIES,
          baseDelayMs: 200,
          label: batchLabel,
        }
      );

      results.push(result);

      logger.info(
        `${batchLabel} completed: ${result.imported.length} imported, ${result.skipped.length} skipped`
      );
    } catch (error) {
      // If all retries fail, mark all rows in this batch as skipped
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logger.error(`${batchLabel} failed after all retries`, {
        error: errorMessage,
      });

      const skippedRows: SkippedRecord[] = batch.rows.map((row, index) => ({
        row_number: batch.startRowNumber + index,
        original_data: row,
        reason: `AI processing failed: ${errorMessage}`,
      }));

      results.push({
        imported: [],
        skipped: skippedRows,
      });
    }
  }

  return results;
}

/**
 * Processes a single batch through Gemini AI.
 * Builds the prompt, calls Gemini, parses the JSON response,
 * and validates it with Zod.
 *
 * @param headers - CSV column headers
 * @param batch - Single batch of rows
 * @param totalBatches - Total batch count (for prompt context)
 * @returns Validated batch result
 */
async function processSingleBatch(
  headers: string[],
  batch: RowBatch,
  totalBatches: number
): Promise<BatchResult> {
  // Build the prompt with headers, rows, and batch context
  const prompt = buildMappingPrompt(
    headers,
    batch.rows,
    batch.batchIndex + 1,
    totalBatches
  );

  logger.debug(
    `Calling Gemini for batch ${batch.batchIndex + 1} (${batch.rows.length} rows)`
  );

  // Initialize model with system instruction
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Low temperature for consistent, deterministic output
    },
  });

  // Call Gemini API
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text || text.trim().length === 0) {
    throw new Error("Gemini returned an empty response");
  }

  // Parse JSON response
  let parsed: unknown;
  try {
    // Clean potential markdown code fences (just in case)
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    parsed = JSON.parse(cleanedText);
  } catch {
    logger.error("Failed to parse Gemini response as JSON", {
      response: text.substring(0, 500),
    });
    throw new Error(
      `Gemini returned invalid JSON. Response starts with: "${text.substring(0, 100)}..."`
    );
  }

  // Validate with Zod schema — uses .catch() defaults for malformed fields
  const validated = batchResponseSchema.safeParse(parsed);

  if (!validated.success) {
    logger.error("Gemini response failed Zod validation", {
      errors: validated.error.flatten(),
    });
    throw new Error(
      `Gemini response validation failed: ${validated.error.message}`
    );
  }

  // Adjust row numbers to be global (not batch-relative)
  const adjustedSkipped = validated.data.skipped.map((record) => ({
    ...record,
    row_number: batch.startRowNumber + record.row_number - 1,
  }));

  return {
    imported: validated.data.imported,
    skipped: adjustedSkipped,
  };
}
