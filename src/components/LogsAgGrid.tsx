import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Download, Eye, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MobileCardSkeleton } from "@/components/ui/mobile-card-skeleton";
import { PullToRefreshContainer } from "@/components/ui/pull-to-refresh";
interface LogData {
  id: number;
  log_id: string;
  log_level: string;
  log_type: string;
  log_message: string;
  log_eventtime: string;
  created_at: string;
  updated_at: string;
  status: string | null;
}
const LogsAgGrid = () => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const fetchLogs = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl.logstore}/logs/?order_by_field=updated_at&order_by_type=DESC&num_records=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setRowData(data.records || []);
      } else {
        console.error("Failed to fetch logs:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pageSize, apiUrl.logstore]);
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 2 * 60 * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchLogs]);
  const LogLevelRenderer = (params: any) => {
    const level = params.value;
    const levelClasses = {
      INFO: "bg-blue-100 text-blue-800",
      WARNING: "bg-yellow-100 text-yellow-800",
      ERROR: "bg-red-100 text-red-800",
      DEBUG: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-semibold",
          levelClasses[level as keyof typeof levelClasses] || "bg-gray-100 text-gray-800",
        )}
      >
        {level}
      </span>
    );
  };
  const MessageRenderer = (params: any) => {
    return (
      <div className="text-sm text-foreground truncate" title={params.value}>
        {params.value}
      </div>
    );
  };
  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return (
      <div className="text-sm">
        {date.toLocaleDateString("en-IN")} •{" "}
        {date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    );
  };
  const columnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 80,
      cellClass: "font-medium text-center",
    },
    {
      headerName: "Log ID",
      field: "log_id",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: "font-medium text-black", // Changed from text-primary (yellow) to text-black
    },
    {
      headerName: "Log Level",
      field: "log_level",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellRenderer: LogLevelRenderer,
    },
    {
      headerName: "Log Type",
      field: "log_type",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 100,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Log Message",
      field: "log_message",
      sortable: true,
      filter: true,
      flex: 3,
      minWidth: 300,
      cellRenderer: MessageRenderer,
    },
    {
      headerName: "Time",
      field: "log_eventtime",
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 160,
      cellRenderer: DateRenderer,
    },
  ];
  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
    // Listen for window resize to re-fit columns
    const handleResize = () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 300);
    };
    window.addEventListener('resize', handleResize);
    // Also observe container resize for sidebar toggle
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    const gridElement = document.querySelector('.ag-theme-alpine');
    if (gridElement) {
      resizeObserver.observe(gridElement);
    }
  }, []);
  const handleGlobalFilter = useCallback((value: string) => {
    setGlobalFilter(value);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", value);
    }
  }, []);
  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `logs-${new Date().toISOString().split("T")[0]}.csv`,
      });
    }
  };
  const hasData = rowData.length > 0;
  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Compact Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-3">
        {/* Table Title and Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          {/* Single line for all controls on desktop */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Logs</h2>

              {/* Auto Refresh Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-refresh-logs"
                  checked={autoRefresh}
                  onCheckedChange={(checked) => setAutoRefresh(checked === true)}
                />
                <label
                  htmlFor="auto-refresh-logs"
                  className="text-sm text-muted-foreground font-medium whitespace-nowrap"
                >
                  Auto Refresh (2m)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>

                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and pagination in single line */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={globalFilter}
                  onChange={(e) => handleGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? (
          <>
            <div className="hidden md:flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div className="block md:hidden">
              <MobileCardSkeleton variant="log" count={5} />
            </div>
          </>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-200px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: "flex items-center",
                  }}
                  pagination={true}
                  paginationPageSize={pageSize}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
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
                onRefresh={async () => {
                  await fetchLogs();
                }}
                className="max-h-[calc(100vh-280px)]"
              >
                <div className="space-y-4 pb-4">
                  {rowData.map((log) => (
                    <Card key={log.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ID: {log.id}</div>
                            <div className="text-lg font-semibold text-black mt-1">{log.log_id}</div>
                          </div>
                          <span
                            className={cn("px-2 py-1 rounded-full text-xs font-semibold self-start", {
                              "bg-blue-100 text-blue-800": log.log_level === "INFO",
                              "bg-yellow-100 text-yellow-800": log.log_level === "WARNING",
                              "bg-red-100 text-red-800": log.log_level === "ERROR",
                              "bg-gray-100 text-gray-800": log.log_level === "DEBUG",
                            })}
                          >
                            {log.log_level}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Type:</span> {log.log_type}
                          </div>
                          <div className="text-sm flex items-start">
                            <span className="font-medium text-gray-700 shrink-0 mr-1">Message:</span>
                            <div className="text-muted-foreground truncate" title={log.log_message}>
                              {log.log_message}
                            </div>
                          </div>
                          <div className="text-sm flex items-center">
                            <span className="font-medium text-gray-700 shrink-0 mr-1">Time:</span>
                            <div>
                              {new Date(log.log_eventtime).toLocaleDateString("en-IN")} •{" "}
                              {new Date(log.log_eventtime).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </div>
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
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-gray-500 text-center">
              <p>No log data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default LogsAgGrid;
