"use client";

import { Upload, Table, BarChart3, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  /** Current step number (1-3) */
  currentStep: number;
}

const STEPS = [
  { number: 1, label: "Upload", icon: Upload },
  { number: 2, label: "Preview", icon: Table },
  { number: 3, label: "Results", icon: BarChart3 },
];

/**
 * Visual step indicator showing Upload → Preview → Results.
 * Completed steps show a checkmark, active step is highlighted,
 * future steps are dimmed.
 */
export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 sm:gap-2 py-6">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const Icon = step.icon;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted &&
                    "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
                  isActive &&
                    "border-violet-500 bg-violet-500/10 text-violet-500 shadow-lg shadow-violet-500/25 scale-110",
                  !isCompleted &&
                    !isActive &&
                    "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 animate-in zoom-in duration-200" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive && "text-violet-500",
                  isCompleted && "text-emerald-500",
                  !isActive && !isCompleted && "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 sm:mx-4 h-0.5 w-12 sm:w-20 rounded-full transition-all duration-500 mb-5",
                  currentStep > step.number
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
