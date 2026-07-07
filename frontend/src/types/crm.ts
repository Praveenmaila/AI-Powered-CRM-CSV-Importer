// ═══════════════════════════════════════════════
// CRM Domain Types (Frontend)
// ═══════════════════════════════════════════════

/**
 * CRM lead status enum values.
 */
export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CRMStatus = (typeof CRM_STATUS_VALUES)[number];

/**
 * CRM data source enum values.
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
 * A fully mapped CRM record — matches the backend schema.
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
 * Display labels for CRM status values.
 */
export const CRM_STATUS_LABELS: Record<CRMStatus, string> = {
  GOOD_LEAD_FOLLOW_UP: "Good Lead",
  DID_NOT_CONNECT: "Not Connected",
  BAD_LEAD: "Bad Lead",
  SALE_DONE: "Sale Done",
};

/**
 * Colors for CRM status badges (Tailwind classes).
 */
export const CRM_STATUS_COLORS: Record<CRMStatus, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  DID_NOT_CONNECT: { bg: "bg-amber-500/15", text: "text-amber-400" },
  BAD_LEAD: { bg: "bg-red-500/15", text: "text-red-400" },
  SALE_DONE: { bg: "bg-blue-500/15", text: "text-blue-400" },
};
