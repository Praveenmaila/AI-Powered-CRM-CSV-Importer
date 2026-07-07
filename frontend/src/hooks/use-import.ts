"use client";

import { useState, useCallback } from "react";
import { importCSV } from "@/lib/api";
import type { ImportResponse, ImportStatus } from "@/types/api";

// ═══════════════════════════════════════════════
// Import Hook
// ═══════════════════════════════════════════════

interface UseImportReturn {
  /** Import status: idle | uploading | processing | success | error */
  status: ImportStatus;
  /** Import result data (null before completion) */
  result: ImportResponse | null;
  /** Error message if import failed */
  error: string | null;
  /** Progress percentage (0-100), simulated during processing */
  progress: number;
  /** Trigger the import */
  startImport: (file: File) => Promise<void>;
  /** Reset state to initial */
  reset: () => void;
}

/**
 * Hook that manages the CSV import lifecycle.
 * Handles API call, progress simulation, and error states.
 */
export function useImport(): UseImportReturn {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startImport = useCallback(async (file: File) => {
    setStatus("uploading");
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress since we don't have real-time streaming
    const progressInterval = startProgressSimulation(setProgress);

    try {
      setStatus("processing");
      const response = await importCSV(file);

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response);
      setStatus("success");
    } catch (err) {
      clearInterval(progressInterval);
      const message =
        err instanceof Error ? err.message : "Import failed unexpectedly";
      setError(message);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { status, result, error, progress, startImport, reset };
}

/**
 * Simulates progress advancement during the import.
 * Progresses quickly at first, then slows down approaching 90%.
 * Never reaches 100% — that's set when the actual response arrives.
 */
function startProgressSimulation(
  setProgress: React.Dispatch<React.SetStateAction<number>>
): NodeJS.Timeout {
  return setInterval(() => {
    setProgress((prev) => {
      if (prev >= 90) return prev; // Cap at 90% until real response
      // Logarithmic slowdown: fast at start, slow near 90%
      const increment = Math.max(0.5, (90 - prev) * 0.05);
      return Math.min(90, prev + increment);
    });
  }, 300);
}
