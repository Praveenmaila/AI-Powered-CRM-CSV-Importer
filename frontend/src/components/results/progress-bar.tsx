"use client";

import { Brain, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status message */
  status: "uploading" | "processing";
}

/**
 * Import progress indicator shown during AI processing.
 * Features animated gradient progress bar, pulsing icon,
 * and status message.
 */
export function ImportProgressBar({ progress, status }: ProgressBarProps) {
  const message =
    status === "uploading"
      ? "Uploading CSV to server..."
      : progress < 30
        ? "Parsing CSV and preparing batches..."
        : progress < 70
          ? "Gemini AI is mapping your data..."
          : progress < 90
            ? "Processing remaining batches..."
            : "Finalizing results...";

  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Animated AI icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/30">
            {status === "uploading" ? (
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            ) : (
              <Brain className="h-7 w-7 text-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{message}</span>
            <span
              className={cn(
                "font-mono font-medium tabular-nums",
                progress >= 90 ? "text-emerald-500" : "text-violet-500"
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground/60 text-center max-w-sm">
          This may take a moment depending on the size of your CSV. Each batch of ~25 rows is processed by Gemini AI.
        </p>
      </div>
    </div>
  );
}
