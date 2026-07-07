"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { CSVRow } from "@/types/csv";
import { truncate } from "@/lib/utils";

/**
 * Dynamically generates TanStack Table column definitions
 * from CSV headers.
 *
 * - Adds a row number column as the first column
 * - Each CSV header becomes a column
 * - Long values are truncated with title tooltip
 * - Long headers are truncated
 */
export function generateColumns(headers: string[]): ColumnDef<CSVRow>[] {
  // Row number column
  const rowNumberColumn: ColumnDef<CSVRow> = {
    id: "_row_number",
    header: () => (
      <span className="text-xs font-semibold text-muted-foreground">#</span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.index + 1}
      </span>
    ),
    size: 50,
    enableResizing: false,
  };

  // CSV data columns
  const dataColumns: ColumnDef<CSVRow>[] = headers.map((header) => ({
    accessorKey: header,
    header: () => (
      <span className="text-xs font-semibold" title={header}>
        {truncate(header, 25)}
      </span>
    ),
    cell: ({ getValue }) => {
      const value = String(getValue() ?? "");
      return (
        <span className="text-sm" title={value.length > 40 ? value : undefined}>
          {truncate(value, 40)}
        </span>
      );
    },
    size: Math.max(120, Math.min(250, header.length * 10 + 60)),
  }));

  return [rowNumberColumn, ...dataColumns];
}
