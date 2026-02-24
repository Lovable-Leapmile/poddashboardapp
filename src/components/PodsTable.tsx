import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Eye, RefreshCw, Download, FileSpreadsheet, FileText, ArrowLeft, Plus, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddPodPopup from "./AddPodPopup";
import TableFilters, { FilterConfig } from "@/components/filters/TableFilters";
import { useTableFilters } from "@/hooks/useTableFilters";
import { exportTableData, ExportFormat } from "@/lib/tableExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardApi, Pod } from "@/services/dashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import NoDataIllustration from "@/components/ui/no-data-illustration";
import { MobileCardSkeleton } from "@/components/ui/mobile-card-skeleton";
import { PullToRefreshContainer } from "@/components/ui/pull-to-refresh";

interface PodsTableProps {
  onPodClick: (id: number) => void;
  isDashboard?: boolean;
}

const PodsTable: React.FC<PodsTableProps> = ({ onPodClick, isDashboard = false }) => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [showAddPodPopup, setShowAddPodPopup] = useState(false);

  const { filters, setFilters, filteredData, resetFilters } = useTableFilters<Pod>(
    pods,
    ["pod_name", "location_name", "pod_health"],
    "status",
    undefined,
  );

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPods(accessToken, pageSize);
      setPods(data || []);
    } catch (error) {
      console.error("Error fetching pods:", error);
      setPods([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPodActive = (pingedAt: string | undefined | null): boolean => {
    if (!pingedAt) return false;
    try {
      const pingedTime = new Date(pingedAt.replace(" ", "T")).getTime();
      const now = Date.now();
      return (now - pingedTime) <= 5 * 60 * 1000; // 5 minutes
    } catch {
      return false;
    }
  };

  const StatusBadge: React.FC<{ pingedAt?: string }> = ({ pingedAt }) => {
    const active = isPodActive(pingedAt);
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-semibold inline-block",
          active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
        )}
      >
        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  const PowerStatusBadge: React.FC<{ value?: string }> = ({ value = "" }) => {
    const v = (value || "").toLowerCase();
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-semibold inline-block",
          v === "raw" ? "bg-green-100 text-green-800" : v === "ups" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800",
        )}
      >
        {value || "N/A"}
      </span>
    );
  };

  const ActionRenderer = ({ data }: { data: Pod }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onPodClick(data.id);
      }}
      className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
      title="View Pod Details"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const columnDefs: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 80,
      cellClass: "font-medium text-center",
    },
    {
      field: "pod_name",
      headerName: "Pod Name",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 150,
      cellClass: "font-medium",
    },
    {
      field: "pod_power_status",
      headerName: "Power",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellRenderer: ({ value }: { value: string }) => <PowerStatusBadge value={value} />,
      cellClass: "text-center",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellRenderer: ({ data }: { data: Pod }) => <StatusBadge pingedAt={data.pinged_at} />,
      cellClass: "text-center",
    },
    {
      field: "pod_health",
      headerName: "Health",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellClass: "text-muted-foreground text-center",
    },
    {
      field: "pod_numtotaldoors",
      headerName: "Doors",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 80,
      cellClass: "text-muted-foreground text-center",
    },
    {
      field: "location_name",
      headerName: "Location",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 150,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      // cellClass: "flex items-center justify-center",
    },
  ];

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (format: ExportFormat) => {
    const exportColumns = columnDefs
      .filter((col) => !!col.field)
      .map((col) => ({
        field: col.field!,
        headerName: col.headerName || col.field,
      }));

    exportTableData({
      data: filteredData,
      columns: exportColumns,
      filename: "pods",
      format,
    });
  };

  const filterConfig: FilterConfig = {
    searchPlaceholder: "Search pods...",
    statusOptions: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    dateRangeEnabled: false,
  };

  const hasData = filteredData.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-[4px]">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-4">
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-1 h-8 px-2 sm:px-3 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Pods</h2>
              </div>
            </div>

            {/* Controls Row - Wraps on mobile */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setShowAddPodPopup(true)}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center h-8 px-2 sm:px-3"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Pod</span>
              </Button>

              <Button
                onClick={() => navigate("/pods/onboard")}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center h-8 px-2 sm:px-3"
                size="sm"
              >
                <Cpu className="w-4 h-4 mr-1" />
                <span>Onboard Pod</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                    <Download className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={refreshData} className="h-8 px-2 sm:px-3">
                <RefreshCw className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {/* Filters */}
            <TableFilters config={filterConfig} state={filters} onChange={setFilters} onReset={resetFilters} />
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {loading ? (
          <>
            <div className="hidden md:flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
            <div className="block md:hidden">
              <MobileCardSkeleton variant="pod" count={5} />
            </div>
          </>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div
                className={`ag-theme-alpine ${isDashboard ? "h-[400px]" : "h-[calc(100vh-240px)]"} w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm`}
              >
                <AgGridReact
                  ref={gridRef}
                  rowData={filteredData}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: "flex items-center",
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
                />
              </div>
            </div>

            {/* Mobile view - Cards with Pull to Refresh */}
            <div className="block md:hidden">
              <PullToRefreshContainer
                onRefresh={async () => { await fetchData(); }}
                className="max-h-[calc(100vh-240px)]"
              >
                <div className="space-y-4 pb-4">
                  {filteredData.map((pod) => (
                    <Card key={pod.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 flex items-center space-x-3">
                            <Package className="h-5 w-5 text-gray-700 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">ID: {pod.id}</div>
                              <div className="text-lg font-semibold mt-1">{pod.pod_name}</div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPodClick(pod.id);
                            }}
                            className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Power:</span>
                            <PowerStatusBadge value={pod.pod_power_status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <StatusBadge pingedAt={pod.pinged_at} />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Health:</span> {pod.pod_health}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Doors:</span> {pod.pod_numtotaldoors}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Location:</span> {pod.location_name}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </PullToRefreshContainer>
            </div>
          </>
        ) : (
          <NoDataIllustration
            title="No pods found"
            description={pods.length === 0 ? "No pods data available." : "No matching pods found with the applied filters."}
            icon="package"
            showRefresh
            onRefresh={refreshData}
          />
        )}
      </div>

      {/* Add Pod Popup */}
      <AddPodPopup
        open={showAddPodPopup}
        onOpenChange={setShowAddPodPopup}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default PodsTable;
