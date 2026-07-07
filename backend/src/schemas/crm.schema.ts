import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../types/crm.types";

// ═══════════════════════════════════════════════
// CRM Record Validation Schema
// ═══════════════════════════════════════════════

/**
 * Validates a single CRM record returned by Gemini.
 * All fields are strings — empty string is allowed for optional fields.
 * Status and data_source are strict enums.
 */
export const crmRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z
    .enum(CRM_STATUS_VALUES)
    .default("DID_NOT_CONNECT")
    .catch("DID_NOT_CONNECT"),
  crm_note: z.string().default(""),
  data_source: z
    .enum(DATA_SOURCE_VALUES)
    .default("leads_on_demand")
    .catch("leads_on_demand"),
  possession_time: z.string().default(""),
  description: z.string().default(""),
});

export type ValidatedCRMRecord = z.infer<typeof crmRecordSchema>;
