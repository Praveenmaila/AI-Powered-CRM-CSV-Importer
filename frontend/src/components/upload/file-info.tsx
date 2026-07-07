"use client";

import { FileSpreadsheet, X, Columns, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface FileInfoProps {
  /** The selected file */
  file: File;
  /** Number of rows parsed */
  rowCount: number;
  /** Number of columns detected */
  columnCount: number;
  /** Called when user wants to remove the file */
  onRemove: () => void;
}

/**
 * Displays metadata about the selected CSV file.
 * Shows filename, size, row count, and column count.
 * Includes a remove button to go back to upload.
 */
export function FileInfo({ file, rowCount, columnCount, onRemove }: FileInfoProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
        <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
      </div>

      {/* File details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{file.name}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span className="flex items-center gap-1">
            <Rows3 className="h-3 w-3" />
            {rowCount.toLocaleString()} rows
          </span>
          <span className="flex items-center gap-1">
            <Columns className="h-3 w-3" />
            {columnCount} columns
          </span>
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
