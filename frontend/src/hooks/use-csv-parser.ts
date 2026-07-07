"use client";

import { useState, useCallback } from "react";
import { parseCSVFile } from "@/lib/csv-parser";
import type { ParsedCSV } from "@/types/csv";

// ═══════════════════════════════════════════════
// CSV Parser Hook
// ═══════════════════════════════════════════════

interface UseCSVParserReturn {
  /** Parsed CSV data (null before parsing) */
  data: ParsedCSV | null;
  /** Whether parsing is in progress */
  isLoading: boolean;
  /** Error message if parsing failed */
  error: string | null;
  /** Trigger parsing of a file */
  parseFile: (file: File) => Promise<void>;
  /** Reset state to initial */
  reset: () => void;
}

/**
 * Hook that wraps PapaParse for client-side CSV parsing.
 * Manages loading, error, and data states.
 */
export function useCSVParser(): UseCSVParserReturn {
  const [data, setData] = useState<ParsedCSV | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await parseCSVFile(file);
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse CSV file";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, parseFile, reset };
}
