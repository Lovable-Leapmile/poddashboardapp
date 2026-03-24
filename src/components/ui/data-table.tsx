import React, { useRef, useCallback, ReactNode } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, FileSpreadsheet, FileText, LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TableFilters, { FilterConfig, FilterState } from '@/components/filters/TableFilters';
import { exportTableData, ExportFormat } from '@/lib/tableExport';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import { MobileCardSkeleton, MobileCardSkeletonProps } from '@/components/ui/mobile-card-skeleton';
import { PullToRefreshContainer } from '@/components/ui/pull-to-refresh';

export interface DataTableProps<T> {
  // Data
  data: T[];
  rawData: T[];
  loading: boolean;
  
  // Table config
  title: string;
  icon: LucideIcon;
  columnDefs: ColDef[];
  pageSize?: number;
  filename: string;
  
  // Filtering
  filterConfig: FilterConfig;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
  onFilterReset: () => void;
  
  // Actions
  onRefresh: () => void;
  
  // Mobile
  mobileCardRenderer: (item: T, index: number) => ReactNode;
  mobileSkeletonVariant?: MobileCardSkeletonProps['variant'];
  
  // Optional
  headerActions?: ReactNode;
  isDashboard?: boolean;
  emptyIcon?: 'inbox' | 'file' | 'package' | 'map-pin';
  emptyTitle?: string;
  emptyDescription?: string;
  tableHeight?: string;
  onRowClick?: (data: T) => void;
}

export function DataTable<T extends { id: number | string }>({
  data,
  rawData,
  loading,
  title,
  icon: Icon,
  columnDefs,
  pageSize = 25,
  filename,
  filterConfig,
  filterState,
  onFilterChange,
  onFilterReset,
  onRefresh,
  mobileCardRenderer,
  mobileSkeletonVariant = 'default',
  headerActions,
  isDashboard = false,
  emptyIcon = 'inbox',
  emptyTitle,
  emptyDescription,
  tableHeight,
}: DataTableProps<T>) {
  const gridRef = useRef<AgGridReact>(null);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleExport = useCallback((format: ExportFormat) => {
    const exportColumns = columnDefs
      .filter(col => col.field)
      .map(col => ({
        field: col.field!,
        headerName: col.headerName || col.field!,
      }));

    exportTableData({
      data,
      columns: exportColumns,
      filename,
      format,
    });
  }, [columnDefs, data, filename]);

  const hasData = data.length > 0;
  const defaultHeight = isDashboard ? 'h-[400px]' : 'h-[calc(100vh-240px)]';
  const gridHeight = tableHeight || defaultHeight;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-[4px]">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-4">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>

            <div className="flex items-center space-x-2">
              {headerActions}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          <TableFilters
            config={filterConfig}
            state={filterState}
            onChange={onFilterChange}
            onReset={onFilterReset}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? (
          <>
            <div className="hidden md:flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
            <div className="block md:hidden">
              <MobileCardSkeleton variant={mobileSkeletonVariant} count={5} />
            </div>
          </>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className={`ag-theme-alpine ${gridHeight} w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
                <AgGridReact
                  ref={gridRef}
                  rowData={data}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: 'flex items-center',
                  }}
                  pagination={true}
                  paginationPageSize={pageSize}
                  loading={loading}
                  suppressRowHoverHighlight={false}
                  suppressCellFocus={true}
                  animateRows={true}
                  rowBuffer={10}
                  enableCellTextSelection={true}
                  onGridReady={onGridReady}
                  rowHeight={36}
                  headerHeight={38}
                  suppressColumnVirtualisation={true}
                  rowSelection="single"
                  suppressRowClickSelection={true}
                  onRowClicked={onRowClick ? (event) => {
                    if (event.data) onRowClick(event.data);
                  } : undefined}
                />
              </div>
            </div>

            {/* Mobile view - Cards with Pull to Refresh */}
            <div className="block md:hidden">
              <PullToRefreshContainer
                onRefresh={async () => { onRefresh(); }}
                className="max-h-[calc(100vh-280px)]"
              >
                <div className="space-y-4 pb-4">
                  {data.map((item, index) => mobileCardRenderer(item, index))}
                </div>
              </PullToRefreshContainer>
            </div>
          </>
        ) : (
          <NoDataIllustration
            title={emptyTitle || `No ${title.toLowerCase()} found`}
            description={
              emptyDescription || (rawData.length === 0
                ? `No ${title.toLowerCase()} data available.`
                : `No matching ${title.toLowerCase()} found with the applied filters.`)
            }
            icon={emptyIcon}
            showRefresh
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
}

export default DataTable;
