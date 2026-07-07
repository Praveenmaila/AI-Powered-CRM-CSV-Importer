"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { SkippedRecord } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/preview/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { truncate } from "@/lib/utils";

interface SkippedTableProps {
  records: SkippedRecord[];
}

/**
 * Table showing skipped rows with their skip reasons.
 * Helps users understand why certain rows weren't imported.
 */
export function SkippedTable({ records }: SkippedTableProps) {
  const columns = useMemo<ColumnDef<SkippedRecord>[]>(
    () => [
      {
        accessorKey: "row_number",
        header: () => <span className="text-xs font-semibold">Row #</span>,
        cell: ({ getValue }) => (
          <span className="text-sm font-mono text-muted-foreground">
            {String(getValue())}
          </span>
        ),
        size: 70,
      },
      {
        id: "original_data",
        header: () => <span className="text-xs font-semibold">Original Data</span>,
        cell: ({ row }) => {
          const data = row.original.original_data;
          const preview = Object.entries(data)
            .slice(0, 3)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" | ");
          const full = JSON.stringify(data, null, 2);
          return (
            <span
              className="text-xs text-muted-foreground font-mono"
              title={full}
            >
              {truncate(preview, 60)}
            </span>
          );
        },
        size: 350,
      },
      {
        accessorKey: "reason",
        header: () => <span className="text-xs font-semibold">Reason</span>,
        cell: ({ getValue }) => (
          <Badge variant="warning" className="text-[11px] font-normal">
            {String(getValue())}
          </Badge>
        ),
        size: 250,
      },
    ],
    []
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rows were skipped. All records imported successfully! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={index % 2 === 0 ? "" : "bg-muted/20"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="border-t border-border/50">
          <Pagination table={table} />
        </div>
      </div>
    </div>
  );
}
