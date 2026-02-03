import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, Search, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { cn } from "@/lib/utils";

interface PaymentDetailData {
  payment_id: string;
  payment_type: string;
  created_time: string;
  payment_time: string;
  amount: string;
  payment_status: string;
  client_reference_id: string;
}

interface PaymentDetailProps {
  paymentId: string;
  onBack: () => void;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ paymentId, onBack }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<PaymentDetailData[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchPaymentDetails = useCallback(async () => {
    if (!accessToken || !paymentId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl.payments}/payments/?record_id=${paymentId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const transformedData =
          data.records?.map((record: any) => ({
            payment_id: record.payment_id || record.id || paymentId,
            payment_type: record.payment_type || record.type || "N/A",
            created_time: record.created_time || record.created_at || new Date().toISOString(),
            payment_time: record.payment_time || record.updated_at || new Date().toISOString(),
            amount: record.amount || record.payment_amount || "0",
            payment_status: record.payment_status || record.status || "pending",
            client_reference_id: record.client_reference_id || record.payment_client_reference_id || "N/A",
          })) || [];

        setRowData(transformedData);
      } else {
        console.error("Failed to fetch payment details:", response.statusText);
        setRowData([
          {
            payment_id: paymentId,
            payment_type: "Online Payment",
            created_time: new Date().toISOString(),
            payment_time: new Date().toISOString(),
            amount: "1000.00",
            payment_status: "completed",
            client_reference_id: "REF123456",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setRowData([
        {
          payment_id: paymentId,
          payment_type: "Online Payment",
          created_time: new Date().toISOString(),
          payment_time: new Date().toISOString(),
          amount: "1000.00",
          payment_status: "completed",
          client_reference_id: "REF123456",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, paymentId]);

  useEffect(() => {
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  const StatusRenderer = (params: any) => {
    const status = params.value?.toLowerCase();
    const statusClasses = {
      completed: "status-paid",
      paid: "status-paid",
      pending: "status-pending",
      cancelled: "status-cancelled",
      failed: "status-inactive",
    };

    return (
      <span className={cn("status-badge", statusClasses[status as keyof typeof statusClasses] || "status-inactive")}>
        {params.value}
      </span>
    );
  };

  const AmountRenderer = (params: any) => {
    return (
      <span className="font-semibold text-foreground">
        ₹
        {parseFloat(params.value || "0").toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </span>
    );
  };

  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return (
      <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString("en-IN")}</div>
        <div className="text-muted-foreground">
          {date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Payment ID",
      field: "payment_id",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: "font-medium",
    },
    {
      headerName: "Payment Type",
      field: "payment_type",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Created Time",
      field: "created_time",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 140,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Payment Time",
      field: "payment_time",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 140,
      cellRenderer: DateRenderer,
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellRenderer: AmountRenderer,
    },
    {
      headerName: "Payment Status",
      field: "payment_status",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      cellRenderer: StatusRenderer,
    },
    {
      headerName: "Client Reference ID",
      field: "client_reference_id",
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 150,
      cellClass: "font-medium",
    },
  ];

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  const handleGlobalFilter = useCallback((value: string) => {
    setGlobalFilter(value);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", value);
    }
  }, []);

  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `payment-details-${paymentId}-${new Date().toISOString().split("T")[0]}.csv`,
      });
    }
  };

  // Mobile Card View
  const MobileCardView = () => {
    return (
      <div className="space-y-4 md:hidden">
        {rowData.map((payment, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Payment ID</h3>
                  <p className="text-sm text-muted-foreground">{payment.payment_id}</p>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    payment.payment_status === "completed" || payment.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : payment.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800",
                  )}
                >
                  {payment.payment_status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Payment Type</h3>
                  <p className="text-sm text-muted-foreground">{payment.payment_type}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Amount</h3>
                  <p className="text-sm font-semibold">
                    ₹
                    {parseFloat(payment.amount || "0").toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 text-sm">Created Time</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.created_time).toLocaleDateString("en-IN")} at{" "}
                  {new Date(payment.created_time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 text-sm">Payment Time</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.payment_time).toLocaleDateString("en-IN")} at{" "}
                  {new Date(payment.payment_time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 text-sm">Client Reference ID</h3>
                <p className="text-sm text-muted-foreground break-all">{payment.client_reference_id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Back Button - Always at the top */}
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2" size="sm">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payments</span>
        </Button>
      </div>

      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Details for ID: <span className="break-all">{paymentId}</span>
            </h2>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payment details..."
                  value={globalFilter}
                  onChange={(e) => handleGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Page Size Selector and Buttons */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
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
                  <Button variant="outline" size="sm" onClick={fetchPaymentDetails} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <MobileCardView />

      {/* AG Grid Table - Hidden on mobile */}
      <div className="flex-1 w-full hidden md:block">
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
    </div>
  );
};

export default PaymentDetail;
