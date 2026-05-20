"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGE_SIZE_DEFAULT } from "@/lib/constants";
import { exportarCSV } from "@/lib/csv/export";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  csv?: (row: T) => string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  exportName?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  /** Texto exibido quando dados estão vazios. */
  emptyLabel?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  pageSize = PAGE_SIZE_DEFAULT,
  exportName,
  emptyState,
  loading,
  emptyLabel = "Nenhum registro.",
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(
    () => data.slice(page * pageSize, page * pageSize + pageSize),
    [data, page, pageSize],
  );

  const handleExport = () => {
    if (!exportName) return;
    exportarCSV({
      dados: data as unknown as Record<string, unknown>[],
      colunas: columns
        .filter((c) => c.csv)
        .map((c) => ({
          key: c.key,
          label: c.label,
          format: (row: Record<string, unknown>) =>
            c.csv ? c.csv(row as unknown as T) : "",
        })),
      nomeArquivo: exportName,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-surface-2 animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="solid-surface p-3xl text-center text-text-3">
        {emptyState ?? emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {exportName ? (
        <div className="flex items-center justify-between gap-md">
          <span className="text-body-sm text-text-3">
            {data.length} {data.length === 1 ? "registro" : "registros"}
          </span>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} strokeWidth={1.8} />
            Exportar CSV
          </Button>
        </div>
      ) : null}

      {/* Desktop: tabela */}
      <div className="hidden lg:block solid-surface overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-thin">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-label-caps text-text-3 px-md py-sm text-left",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border-thin transition-colors duration-fast",
                  onRowClick && "cursor-pointer hover:bg-surface-2",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-md py-sm text-body-md text-text-1",
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards empilhados */}
      <div className="lg:hidden flex flex-col gap-sm">
        {pageData.map((row) => (
          <div
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "solid-surface p-md flex flex-col gap-xs",
              onRowClick && "cursor-pointer solid-surface-hover",
            )}
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-md"
                >
                  <span className="text-label-caps text-text-3 shrink-0">
                    {col.label}
                  </span>
                  <span className="text-body-md text-text-1 text-right">
                    {col.render(row)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-md pt-md">
          <span className="text-body-sm text-text-3">
            Página {page + 1} de {pageCount}
          </span>
          <div className="flex items-center gap-xs">
            <Button
              variant="secondary"
              size="iconSm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Anterior"
            >
              <ChevronLeft size={16} strokeWidth={1.8} />
            </Button>
            <Button
              variant="secondary"
              size="iconSm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Próxima"
            >
              <ChevronRight size={16} strokeWidth={1.8} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
