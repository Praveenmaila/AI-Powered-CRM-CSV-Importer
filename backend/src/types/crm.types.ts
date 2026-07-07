// ═══════════════════════════════════════════════
// CRM Domain Types
// ═══════════════════════════════════════════════

/**
 * The 4 allowed CRM lead status values.
 * Gemini must map any status-like column to one of these.
 */
export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CRMStatus = (typeof CRM_STATUS_VALUES)[number];

/**
 * The 5 allowed data source values.
 * Gemini infers these from source/project/campaign columns.
 */
export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

/**
 * A fully mapped CRM record with all 15 fields.
 * Every field is a string — empty string if no mapping found.
 */
export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CRMStatus;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
}

/**
 * All 15 CRM field names as an array — used for validation and display.
 */
export const CRM_FIELD_NAMES: (keyof CRMRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];
