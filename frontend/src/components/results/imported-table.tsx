"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { CRMRecord } from "@/types/crm";
import { CRM_STATUS_LABELS, CRM_STATUS_COLORS } from "@/types/crm";
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
import { truncate, cn } from "@/lib/utils";

interface ImportedTableProps {
  records: CRMRecord[];
}

/**
 * Table showing all successfully imported CRM records.
 * Displays key CRM fields with status badges.
 */
export function ImportedTable({ records }: ImportedTableProps) {
  const columns = useMemo<ColumnDef<CRMRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <span className="text-xs font-semibold">Name</span>,
        cell: ({ getValue }) => (
          <span className="font-medium text-sm">{String(getValue() || "—")}</span>
        ),
        size: 160,
      },
      {
        accessorKey: "email",
        header: () => <span className="text-xs font-semibold">Email</span>,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {truncate(String(getValue() || "—"), 30)}
          </span>
        ),
        size: 200,
      },
      {
        id: "phone",
        header: () => <span className="text-xs font-semibold">Phone</span>,
        cell: ({ row }) => {
          const cc = row.original.country_code;
          const phone = row.original.mobile_without_country_code;
          if (!cc && !phone) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-sm font-mono">
              {cc ? `+${cc} ` : ""}
              {phone || "—"}
            </span>
          );
        },
        size: 170,
      },
      {
        accessorKey: "company",
        header: () => <span className="text-xs font-semibold">Company</span>,
        cell: ({ getValue }) => (
          <span className="text-sm">{String(getValue() || "—")}</span>
        ),
        size: 140,
      },
      {
        accessorKey: "city",
        header: () => <span className="text-xs font-semibold">City</span>,
        cell: ({ getValue }) => (
          <span className="text-sm">{String(getValue() || "—")}</span>
        ),
        size: 120,
      },
      {
        accessorKey: "crm_status",
        header: () => <span className="text-xs font-semibold">Status</span>,
        cell: ({ getValue }) => {
          const status = getValue() as CRMRecord["crm_status"];
          const colors = CRM_STATUS_COLORS[status] || {
            bg: "bg-muted",
            text: "text-muted-foreground",
          };
          return (
            <Badge className={cn(colors.bg, colors.text, "font-medium text-[11px]")}>
              {CRM_STATUS_LABELS[status] || status}
            </Badge>
          );
        },
        size: 140,
      },
      {
        accessorKey: "data_source",
        header: () => <span className="text-xs font-semibold">Source</span>,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {String(getValue() || "—")}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "crm_note",
        header: () => <span className="text-xs font-semibold">Notes</span>,
        cell: ({ getValue }) => {
          const val = String(getValue() || "");
          if (!val) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-xs text-muted-foreground" title={val}>
              {truncate(val, 40)}
            </span>
          );
        },
        size: 180,
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
        No records were imported.
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
