import React, { useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Eye, Users, RefreshCw, Download, FileSpreadsheet, FileText } from "lucide-react";
import TableFilters, { FilterConfig } from "@/components/filters/TableFilters";
import { useTableFilters } from "@/hooks/useTableFilters";
import { exportTableData, ExportFormat } from "@/lib/tableExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/services/dashboardApi";
import AddUserPopup from "./AddUserPopup";
import UserCard from "./UserCard";
import NoDataIllustration from "@/components/ui/no-data-illustration";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
interface UsersAgGridProps {
  users: User[];
  loading: boolean;
  onBack: () => void;
  onUserClick: (userId: number) => void;
  onRefreshUsers: () => void;
}
const ActionCellRenderer: React.FC<{
  data: User;
  onUserClick: (userId: number) => void;
}> = ({ data, onUserClick }) => (
  <div className="flex items-center justify-center h-full">
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onUserClick(data.id);
      }}
      className="h-7 px-3 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-[#FDDC4E] hover:text-black transition-colors"
    >
      View
    </Button>
  </div>
);
const DateCellRenderer: React.FC<{
  value: string;
}> = ({ value }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };
  return <span>{formatDate(value)}</span>;
};
const UsersAgGrid: React.FC<UsersAgGridProps> = ({ users, loading, onBack, onUserClick, onRefreshUsers }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);

  const { filters, setFilters, filteredData, resetFilters } = useTableFilters(
    users,
    ["user_name", "user_type", "user_phone", "user_email", "user_flatno"],
    "user_type",
    undefined,
  );

  const handleAddUserClick = () => {
    setShowAddUserPopup(true);
  };
  const columnDefs: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellClass: "font-medium text-center",
    },
    {
      field: "user_name",
      headerName: "Name",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 180,
      cellClass: "font-medium",
    },
    {
      field: "user_type",
      headerName: "Type",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: "text-muted-foreground",
    },
    {
      field: "user_phone",
      headerName: "Phone",
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 150,
      cellClass: "text-muted-foreground",
    },
    {
      field: "user_email",
      headerName: "Email",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 200,
      cellClass: "text-muted-foreground",
      tooltipField: "user_email",
    },
    {
      field: "user_flatno",
      headerName: "Flat No",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellClass: "text-muted-foreground text-center",
    },
    {
      headerName: "Action",
      field: "action",
      width: 80,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} onUserClick={onUserClick} />,
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: ["flex", "items-center", "justify-center"],
    },
  ];
  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  const refreshData = useCallback(() => {
    onRefreshUsers();
  }, [onRefreshUsers]);

  const handleAddUserSuccess = () => {
    onRefreshUsers();
    setShowAddUserPopup(false);
  };

  const handleExport = (format: ExportFormat) => {
    const exportColumns = columnDefs
      .filter((col) => col.field && col.field !== "action")
      .map((col) => ({
        field: col.field!,
        headerName: col.headerName!,
      }));

    exportTableData({
      data: filteredData,
      columns: exportColumns,
      filename: "users",
      format,
    });
  };

  const filterConfig: FilterConfig = {
    searchPlaceholder: "Search users...",
    statusOptions: [
      { label: "Customer", value: "Customer" },
      { label: "Site Admin", value: "SiteAdmin" },
      { label: "Site Security", value: "SiteSecurity" },
    ],
    dateRangeEnabled: false,
  };

  const hasData = filteredData.length > 0;
  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-4">
      {/* Users Card Section - Compact */}
      <div className="border border-gray-200 rounded-lg lg:rounded-xl bg-white overflow-hidden shadow-sm mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-100 py-[12px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Users className="h-4 w-4 text-gray-900" />
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleAddUserClick}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2 h-8 px-3"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    <Download className="w-3 h-3 mr-1" />
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
              <Button variant="outline" size="sm" onClick={refreshData} className="h-8 px-2 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          <TableFilters config={filterConfig} state={filters} onChange={setFilters} onReset={resetFilters} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-210px)] w-full rounded-lg lg:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pb-4">
                {filteredData.map((user) => (
                  <Card key={user.id} className="bg-white shadow-sm rounded-lg border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {user.id}</div>
                          <div className="text-lg font-semibold mt-1">{user.user_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{user.user_type}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUserClick(user.id);
                          }}
                          className="h-7 px-3 text-xs font-medium transition-colors bg-gray-100 text-gray-600 hover:text-black hover:bg-[#FDDC4E]"
                        >
                          View
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Phone:</span> {user.user_phone || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span> {user.user_email || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Flat No:</span> {user.user_flatno || "N/A"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <NoDataIllustration
            title="No users found"
            description={
              users.length === 0 ? "No users data available." : "No matching users found with the applied filters."
            }
            icon="inbox"
            showRefresh
            onRefresh={refreshData}
          />
        )}
      </div>

      {/* Add User Popup */}
      <AddUserPopup open={showAddUserPopup} onOpenChange={setShowAddUserPopup} onSuccess={handleAddUserSuccess} />
    </div>
  );
};
export default UsersAgGrid;
