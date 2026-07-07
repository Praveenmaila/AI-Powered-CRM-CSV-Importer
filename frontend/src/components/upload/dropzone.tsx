"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/validators";

interface DropzoneProps {
  /** Called when a valid file is selected */
  onFileAccepted: (file: File) => void;
  /** Whether parsing is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Drag & drop file upload zone with visual feedback.
 * Accepts only .csv files up to 10MB.
 *
 * Features:
 * - Drag & drop with hover state
 * - Click to browse
 * - File validation with error display
 * - Animated upload icon
 * - Loading state during parsing
 */
export function Dropzone({ onFileAccepted, isLoading, error }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        // We show error through the error prop managed by parent
        return;
      }

      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "text/csv": [".csv"],
        "application/csv": [".csv"],
        "text/plain": [".csv"],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: isLoading,
      multiple: false,
    });

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer",
          // Default state
          "border-muted-foreground/25 bg-muted/30 hover:border-violet-500/50 hover:bg-violet-500/5",
          // Drag active
          isDragActive &&
            !isDragReject &&
            "border-violet-500 bg-violet-500/10 scale-[1.02] shadow-xl shadow-violet-500/10",
          // Drag reject
          isDragReject &&
            "border-destructive bg-destructive/10 scale-[1.02]",
          // Loading
          isLoading && "opacity-70 pointer-events-none"
        )}
      >
        <input {...getInputProps()} id="csv-file-input" />

        {/* Upload icon */}
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragActive
              ? "bg-violet-500/20 scale-110"
              : "bg-muted group-hover:bg-violet-500/10 group-hover:scale-105"
          )}
        >
          {isDragReject ? (
            <AlertCircle className="h-8 w-8 text-destructive" />
          ) : isDragActive ? (
            <FileSpreadsheet className="h-8 w-8 text-violet-500 animate-bounce" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-violet-500 transition-colors duration-200" />
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          {isDragReject ? (
            <p className="text-base font-semibold text-destructive">
              Invalid file type
            </p>
          ) : isDragActive ? (
            <p className="text-base font-semibold text-violet-500">
              Drop your CSV here
            </p>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground">
                Drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="text-violet-500 font-medium underline underline-offset-4">
                  click to browse
                </span>
              </p>
            </>
          )}
        </div>

        {/* File constraints */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="h-3 w-3" />
            .csv files only
          </span>
          <span>•</span>
          <span>Max 10MB</span>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 h-10 w-10 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Parsing CSV...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
