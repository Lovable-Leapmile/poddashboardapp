import React, { useEffect, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  gridRef: React.RefObject<AgGridReact>;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  className?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  gridRef,
  pageSize,
  onPageSizeChange,
  className = "",
}) => {
  const [, setTick] = useState(0);
  const [pageSizeInput, setPageSizeInput] = useState(String(pageSize));

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  // Attach pagination listener once API is available
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    const attach = () => {
      if (cancelled) return;
      const api = gridRef.current?.api;
      if (!api) {
        requestAnimationFrame(attach);
        return;
      }
      const handler = () => setTick((t) => t + 1);
      api.addEventListener("paginationChanged", handler);
      setTick((t) => t + 1);
      cleanup = () => {
        try {
          api.removeEventListener("paginationChanged", handler);
        } catch {}
      };
    };
    attach();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [gridRef]);

  const api = gridRef.current?.api;
  const totalRows = api ? api.paginationGetRowCount() : 0;
  const currentPage = api ? api.paginationGetCurrentPage() : 0;
  const totalPages = api ? api.paginationGetTotalPages() : 0;
  const effectivePageSize = api ? api.paginationGetPageSize() : pageSize;

  const start = totalRows === 0 ? 0 : currentPage * effectivePageSize + 1;
  const end = Math.min((currentPage + 1) * effectivePageSize, totalRows);

  const goFirst = useCallback(() => api?.paginationGoToFirstPage(), [api]);
  const goPrev = useCallback(() => api?.paginationGoToPreviousPage(), [api]);
  const goNext = useCallback(() => api?.paginationGoToNextPage(), [api]);
  const goLast = useCallback(() => api?.paginationGoToLastPage(), [api]);

  const commitPageSize = () => {
    const n = parseInt(pageSizeInput, 10);
    if (!Number.isFinite(n) || n < 1) {
      setPageSizeInput(String(pageSize));
      return;
    }
    const clamped = Math.min(Math.max(n, 1), 1000);
    if (clamped !== pageSize) onPageSizeChange(clamped);
    setPageSizeInput(String(clamped));
  };

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-gray-200 bg-white rounded-b-xl text-sm text-gray-700 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <Input
          type="number"
          min={1}
          value={pageSizeInput}
          onChange={(e) => setPageSizeInput(e.target.value)}
          onBlur={commitPageSize}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="h-8 w-20"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="whitespace-nowrap">
          {start} to {end} of {totalRows}
        </span>
        <span className="whitespace-nowrap">
          Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goFirst}
            disabled={!canPrev}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={goLast}
            disabled={!canNext}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
