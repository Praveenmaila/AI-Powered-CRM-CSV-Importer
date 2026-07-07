"use client";

import { useState, useCallback } from "react";
import type { ParsedCSV } from "@/types/csv";
import type { ImportResponse } from "@/types/api";

// ═══════════════════════════════════════════════
// Stepper Hook — Step State Machine
// ═══════════════════════════════════════════════

export type Step = "upload" | "preview" | "importing" | "results";

export interface StepperState {
  /** Current active step */
  currentStep: Step;
  /** The raw CSV file selected by the user */
  file: File | null;
  /** Client-side parsed CSV data for preview */
  parsedData: ParsedCSV | null;
  /** Import results from the backend */
  importResult: ImportResponse | null;
}

interface UseStepperReturn extends StepperState {
  /** Move to preview step with parsed data */
  goToPreview: (file: File, data: ParsedCSV) => void;
  /** Move to importing step */
  goToImporting: () => void;
  /** Move to results step with import response */
  goToResults: (result: ImportResponse) => void;
  /** Go back to upload step (full reset) */
  goToUpload: () => void;
  /** Go back one step */
  goBack: () => void;
  /** Step number (1-3) for the stepper UI */
  stepNumber: number;
}

const INITIAL_STATE: StepperState = {
  currentStep: "upload",
  file: null,
  parsedData: null,
  importResult: null,
};

/**
 * State machine for the import wizard steps.
 * Manages transitions and data passing between steps.
 *
 * Flow: Upload → Preview → Importing → Results
 */
export function useStepper(): UseStepperReturn {
  const [state, setState] = useState<StepperState>(INITIAL_STATE);

  const goToPreview = useCallback((file: File, data: ParsedCSV) => {
    setState({
      currentStep: "preview",
      file,
      parsedData: data,
      importResult: null,
    });
  }, []);

  const goToImporting = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: "importing",
    }));
  }, []);

  const goToResults = useCallback((result: ImportResponse) => {
    setState((prev) => ({
      ...prev,
      currentStep: "results",
      importResult: result,
    }));
  }, []);

  const goToUpload = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.currentStep) {
        case "preview":
          return INITIAL_STATE;
        case "results":
          return { ...prev, currentStep: "preview", importResult: null };
        default:
          return prev;
      }
    });
  }, []);

  const stepNumber =
    state.currentStep === "upload"
      ? 1
      : state.currentStep === "preview"
        ? 2
        : 3; // importing & results are both step 3

  return {
    ...state,
    goToPreview,
    goToImporting,
    goToResults,
    goToUpload,
    goBack,
    stepNumber,
  };
}
