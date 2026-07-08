import { describe, it, expect } from "vitest";
import { crmRecordSchema } from "../schemas/crm.schema";
import { splitIntoBatches } from "../services/batch.service";
import { buildMappingPrompt } from "../prompts/mapping.prompt";

describe("CRM Pipeline & Domain Rules Suite", () => {
  describe("1. CRM Record Schema (Zod Validation & Resilience)", () => {
    it("should successfully validate a well-formed CRM record", () => {
      const validRecord = {
        created_at: "2025-06-15T10:00:00Z",
        name: "Rohit Mohammad",
        email: "rohit@test.com",
        country_code: "91",
        mobile_without_country_code: "9579390123",
        company: "TechCorp",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        lead_owner: "Sales Team A",
        crm_status: "GOOD_LEAD_FOLLOW_UP",
        crm_note: "Interested in 3BHK",
        data_source: "meridian_tower",
        possession_time: "Immediate",
        description: "Hot lead from website",
      };

      const result = crmRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Rohit Mohammad");
        expect(result.data.crm_status).toBe("GOOD_LEAD_FOLLOW_UP");
        expect(result.data.data_source).toBe("meridian_tower");
      }
    });

    it("should gracefully fallback to defaults for invalid enum values via .catch()", () => {
      const recordWithInvalidEnums = {
        name: "Test Lead",
        email: "test@example.com",
        crm_status: "INVALID_STATUS_STRING",
        data_source: "UNKNOWN_PROJECT_SOURCE",
      };

      const result = crmRecordSchema.safeParse(recordWithInvalidEnums);
      expect(result.success).toBe(true);
      if (result.success) {
        // Enforce strict domain fallback rules
        expect(result.data.crm_status).toBe("DID_NOT_CONNECT");
        expect(result.data.data_source).toBe("leads_on_demand");
      }
    });

    it("should coerce missing optional fields to empty strings without failing", () => {
      const minimalRecord = {};
      const result = crmRecordSchema.safeParse(minimalRecord);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("");
        expect(result.data.email).toBe("");
        expect(result.data.crm_status).toBe("DID_NOT_CONNECT");
        expect(result.data.data_source).toBe("leads_on_demand");
      }
    });
  });

  describe("2. Batch Service (Row Chunking Engine)", () => {
    it("should wrap rows smaller than batch size into a single batch", () => {
      const sampleRows = Array.from({ length: 9 }, (_, i) => ({
        id: String(i + 1),
        name: `Lead ${i + 1}`,
      }));

      const batches = splitIntoBatches(sampleRows, 25);
      expect(batches.length).toBe(1);
      expect(batches[0].batchIndex).toBe(0);
      expect(batches[0].startRowNumber).toBe(1);
      expect(batches[0].rows.length).toBe(9);
    });

    it("should accurately divide large row arrays into exact batches with correct startRowNumbers", () => {
      const sampleRows = Array.from({ length: 65 }, (_, i) => ({
        id: String(i + 1),
        name: `Lead ${i + 1}`,
      }));

      const batches = splitIntoBatches(sampleRows, 25);
      expect(batches.length).toBe(3);

      // Batch 1: rows 1..25
      expect(batches[0].startRowNumber).toBe(1);
      expect(batches[0].rows.length).toBe(25);

      // Batch 2: rows 26..50
      expect(batches[1].startRowNumber).toBe(26);
      expect(batches[1].rows.length).toBe(25);

      // Batch 3: rows 51..65
      expect(batches[2].startRowNumber).toBe(51);
      expect(batches[2].rows.length).toBe(15);
    });
  });

  describe("3. Gemini AI Prompt Generation", () => {
    it("should generate a complete structured prompt embedding headers and JSON data rows", () => {
      const headers = ["Full_Name", "Email", "Phone", "Project"];
      const rows = [
        {
          Full_Name: "Rohit M",
          Email: "rohit@test.com",
          Phone: "+91-9876543210",
          Project: "Meridian Tower",
        },
      ];

      const prompt = buildMappingPrompt(headers, rows, 1, 1);
      expect(prompt).toContain('"Full_Name", "Email", "Phone", "Project"');
      expect(prompt).toContain("Rohit M");
      expect(prompt).toContain("TARGET CRM SCHEMA");
      expect(prompt).toContain("RULE 1 — SKIP ROWS WITHOUT CONTACT INFO");
      expect(prompt).toContain("DID_NOT_CONNECT");
    });
  });
});
