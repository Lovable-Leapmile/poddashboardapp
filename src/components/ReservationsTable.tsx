import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Eye, CalendarDays, Download, FileSpreadsheet, FileText, ArrowLeft } from "lucide-react";
import TableFilters, { FilterConfig } from "@/components/filters/TableFilters";
import { useTableFilters } from "@/hooks/useTableFilters";
import { exportTableData, ExportFormat } from "@/lib/tableExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, StandardReservation, AdhocReservation } from "@/services/dashboardApi";
import { cn } from "@/lib/utils";
import NoDataIllustration from "@/components/ui/no-data-illustration";
import { MobileCardSkeleton } from "@/components/ui/mobile-card-skeleton";
import { PullToRefreshContainer } from "@/components/ui/pull-to-refresh";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { toast } from "sonner";

interface ReservationsTableProps {
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const ReservationsTable: React.FC<ReservationsTableProps> = ({
  onStandardReservationClick,
  onAdhocReservationClick,
}) => {
  const { accessToken } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [isStandardMode, setIsStandardMode] = useState(true);
  const [standardReservations, setStandardReservations] = useState<StandardReservation[]>([]);
  const [adhocReservations, setAdhocReservations] = useState<AdhocReservation[]>([]);
  const [loading, setLoading] = useState(false);

  const standardFilters = useTableFilters(
    standardReservations,
    ["drop_by_name", "location_name", "created_by_name"],
    "status",
    "created_at",
  );

  const adhocFilters = useTableFilters(
    adhocReservations,
    ["pod_name", "user_phone"],
    "reservation_status",
    "drop_time",
  );

  const currentFilters = isStandardMode ? standardFilters : adhocFilters;
  const { filters, setFilters, filteredData, resetFilters } = currentFilters;

  const fetchStandardReservations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getStandardReservations(accessToken);
      setStandardReservations(data);
    } catch (error) {
      console.error("Error fetching standard reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchAdhocReservations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getAdhocReservations(accessToken);
      setAdhocReservations(data);
    } catch (error) {
      console.error("Error fetching adhoc reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, accessToken, fetchStandardReservations, fetchAdhocReservations]);

  const ActionCellRenderer = ({ data, isStandard }: { data: any; isStandard: boolean }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (isStandard && onStandardReservationClick) {
          onStandardReservationClick(data.id);
        } else if (!isStandard && onAdhocReservationClick) {
          onAdhocReservationClick(data.id);
        }
      }}
      className="text-gray-800 bg-gray-100 hover:bg-gray-200"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

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

  const standardColumnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
      flex: 1,
      minWidth: 80,
      cellClass: "font-medium",
    },
    {
      headerName: "User Name",
      field: "drop_by_name",
      flex: 2,
      minWidth: 150,
      cellClass: "font-medium",
    },
    {
      headerName: "Location",
      field: "location_name",
      flex: 2,
      minWidth: 150,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Created By",
      field: "created_by_name",
      flex: 2,
      minWidth: 150,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      minWidth: 120,
      cellClass: "font-medium",
    },
    {
      headerName: "Created At",
      field: "created_at",
      flex: 2,
      minWidth: 160,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={true} />,
    },
  ];

  const adhocColumnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
      flex: 1,
      minWidth: 80,
      cellClass: "font-medium text-center",
    },
    {
      headerName: "Pod ID",
      field: "pod_name",
      flex: 1,
      minWidth: 120,
      cellClass: "font-medium",
    },
    {
      headerName: "User Phone",
      field: "user_phone",
      flex: 2,
      minWidth: 130,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Drop Time",
      field: "drop_time",
      flex: 2,
      minWidth: 150,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Pickup Time",
      field: "pickup_time",
      flex: 2,
      minWidth: 150,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "RTO Pickup",
      field: "rto_picktime",
      flex: 2,
      minWidth: 150,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Status",
      field: "reservation_status",
      flex: 1,
      minWidth: 120,
      cellClass: "font-medium",
    },
    {
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={false} />,
      cellClass: "flex items-center justify-center",
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

  const refreshData = useCallback(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, fetchStandardReservations, fetchAdhocReservations]);

  const handleExport = (format: ExportFormat) => {
    const currentColumnDefs = isStandardMode ? standardColumnDefs : adhocColumnDefs;
    const exportColumns = currentColumnDefs
      .filter((col) => col.field)
      .map((col) => ({
        field: col.field!,
        headerName: col.headerName!,
      }));

    exportTableData({
      data: filteredData,
      columns: exportColumns,
      filename: isStandardMode ? "standard-reservations" : "adhoc-reservations",
      format,
    });
  };

  const standardFilterConfig: FilterConfig = {
    searchPlaceholder: "Search reservations...",
    statusOptions: [
      { label: "Active", value: "active" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
    dateRangeEnabled: true,
  };

  const adhocFilterConfig: FilterConfig = {
    searchPlaceholder: "Search adhoc reservations...",
    statusOptions: [
      { label: "Pending", value: "pending" },
      { label: "Active", value: "active" },
      { label: "Completed", value: "completed" },
    ],
    dateRangeEnabled: true,
  };

  const currentFilterConfig = isStandardMode ? standardFilterConfig : adhocFilterConfig;
  const hasData = filteredData && filteredData.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-[4px]">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-3">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <CalendarDays className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
            </div>

            <div className="flex items-center space-x-2">
              {/* Mode Switch */}
              <div className="flex items-center space-x-2 mr-4">
                <span className={`text-sm ${isStandardMode ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                  Standard
                </span>
                <Switch
                  checked={!isStandardMode}
                  onCheckedChange={(checked) => setIsStandardMode(!checked)}
                  className="data-[state=checked]:bg-[#FDDC4E]"
                />
                <span className={`text-sm ${!isStandardMode ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                  Adhoc
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          <TableFilters config={currentFilterConfig} state={filters} onChange={setFilters} onReset={resetFilters} />
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {loading ? (
          <>
            <div className="hidden md:flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div className="block md:hidden">
              <MobileCardSkeleton variant="reservation" count={5} />
            </div>
          </>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-240px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact
                  ref={gridRef}
                  rowData={filteredData}
                  columnDefs={isStandardMode ? standardColumnDefs : adhocColumnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: "flex items-center",
                  }}
                  pagination={true}
                  paginationPageSize={25}
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
                  onRowClicked={(event) => {
                    if (event.data) {
                      if (isStandardMode && onStandardReservationClick) {
                        onStandardReservationClick(event.data.id);
                      } else if (!isStandardMode && onAdhocReservationClick) {
                        onAdhocReservationClick(event.data.id);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Mobile view - Cards with Pull to Refresh */}
            <div className="block md:hidden">
              <PullToRefreshContainer
                onRefresh={async () => { await refreshData(); }}
                className="max-h-[calc(100vh-400px)]"
              >
                <div className="space-y-4 pb-4">
                  {(filteredData as any[]).map((reservation) =>
                    isStandardMode ? (
                      <SwipeableCard 
                        key={reservation.id}
                        onDismiss={() => toast.info(`Reservation ${reservation.id} dismissed`)}
                      >
                        <Card className="bg-white shadow-sm rounded-xl border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                                <div className="text-sm text-gray-600 mt-1">{reservation.drop_by_name}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStandardReservationClick?.(reservation.id)}
                                className="text-gray-800 bg-gray-100 hover:bg-gray-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Location:</span> {reservation.location_name}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Created By:</span> {reservation.created_by_name}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Status:</span> {reservation.status}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Created At:</span>{" "}
                                {new Date(reservation.created_at).toLocaleDateString("en-IN")} •{" "}
                                {new Date(reservation.created_at).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SwipeableCard>
                    ) : (
                      <SwipeableCard 
                        key={reservation.id}
                        onDismiss={() => toast.info(`Reservation ${reservation.id} dismissed`)}
                      >
                        <Card className="bg-white shadow-sm rounded-xl border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                                <div className="text-sm text-gray-600 mt-1">Pod: {reservation.pod_name}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAdhocReservationClick?.(reservation.id)}
                                className="text-gray-800 bg-gray-100 hover:bg-gray-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">User Phone:</span> {reservation.user_phone}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Drop Time:</span>{" "}
                                {new Date(reservation.drop_time).toLocaleDateString("en-IN")} •{" "}
                                {new Date(reservation.drop_time).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Pickup Time:</span>{" "}
                                {new Date(reservation.pickup_time).toLocaleDateString("en-IN")} •{" "}
                                {new Date(reservation.pickup_time).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">RTO Pickup:</span>{" "}
                                {new Date(reservation.rto_picktime).toLocaleDateString("en-IN")} •{" "}
                                {new Date(reservation.rto_picktime).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Status:</span> {reservation.reservation_status}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SwipeableCard>
                    ),
                  )}
                </div>
              </PullToRefreshContainer>
            </div>
          </>
        ) : (
          <NoDataIllustration
            title="No reservations found"
            description={
              (isStandardMode ? standardReservations : adhocReservations).length === 0 
                ? "No reservations data available." 
                : "No matching reservations found with the applied filters."
            }
            icon="inbox"
            showRefresh
            onRefresh={refreshData}
          />
        )}
      </div>
    </div>
  );
};

export default ReservationsTable;
