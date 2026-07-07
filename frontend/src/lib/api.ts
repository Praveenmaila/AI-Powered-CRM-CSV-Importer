import type { ImportResponse, ImportErrorResponse } from "@/types/api";

// ═══════════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════════

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Sends a CSV file to the backend for AI-powered CRM mapping.
 *
 * @param file - The CSV File to import
 * @returns ImportResponse on success
 * @throws Error with message from backend on failure
 */
export async function importCSV(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 minute timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/import`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const data: ImportResponse | ImportErrorResponse = await response.json();

    if (!response.ok || !data.success) {
      const errorData = data as ImportErrorResponse;
      throw new Error(
        errorData.error?.message || `Import failed with status ${response.status}`
      );
    }

    return data as ImportResponse;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          "Import timed out after 2 minutes. Try uploading a smaller CSV file."
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during import.");
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks if the backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
