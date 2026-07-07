import { z } from "zod";
import { crmRecordSchema } from "./crm.schema";

// ═══════════════════════════════════════════════
// Import Response Validation Schemas
// ═══════════════════════════════════════════════

/**
 * Schema for a skipped record — includes row number,
 * original data as key-value pairs, and the skip reason.
 */
export const skippedRecordSchema = z.object({
  row_number: z.number().int().nonnegative().default(0),
  original_data: z.record(z.string(), z.string().default("")).default({}),
  reason: z.string().default("Unknown reason"),
});

/**
 * Schema for a single batch response from Gemini.
 * Contains arrays of imported and skipped records.
 */
export const batchResponseSchema = z.object({
  imported: z.array(crmRecordSchema).default([]),
  skipped: z.array(skippedRecordSchema).default([]),
});

/**
 * Schema for the import statistics summary.
 */
export const importStatisticsSchema = z.object({
  total_rows: z.number().int().nonnegative(),
  imported_count: z.number().int().nonnegative(),
  skipped_count: z.number().int().nonnegative(),
  batch_count: z.number().int().nonnegative(),
  processing_time_ms: z.number().nonnegative(),
});

/**
 * Schema for the full import response sent to the frontend.
 */
export const importResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    imported: z.array(crmRecordSchema),
    skipped: z.array(skippedRecordSchema),
    statistics: importStatisticsSchema,
  }),
});

export type ValidatedBatchResponse = z.infer<typeof batchResponseSchema>;
export type ValidatedSkippedRecord = z.infer<typeof skippedRecordSchema>;
