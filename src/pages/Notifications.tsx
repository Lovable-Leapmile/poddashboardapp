import React, { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Settings, Search, Eye, Mail, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApiUrl } from "@/hooks/useApiUrl";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { MobileCardSkeleton } from "@/components/ui/mobile-card-skeleton";
import { PullToRefreshContainer } from "@/components/ui/pull-to-refresh";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
interface SMSRecord {
  id: number;
  sms_to_phone_number: string;
  sms_vendor: string;
  sms_delivery_status: string;
  sms_num_retries: number;
}
interface EmailRecord {
  id: number;
  email_to_address: string;
  email_vendor: string;
  email_delivery_status: string;
  email_num_retries: number;
}
const ActionButtonRenderer = ({ data, refresh }: { data: any; refresh: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-full gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          toast.info(`Retrying ${data.id}`);
          refresh();
        }}
        className="text-xs"
      >
        Retry
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const type = data.sms_to_phone_number ? "sms" : "email";
          navigate(`/notification/${type}/${data.id}`);
        }}
        className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};
const NotificationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [smsData, setSmsData] = useState<SMSRecord[]>([]);
  const [emailData, setEmailData] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [smsGridApi, setSmsGridApi] = useState<GridApi | null>(null);
  const [emailGridApi, setEmailGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Settings state
  const [selectedVendor, setSelectedVendor] = useState("");
  const [enableSMS, setEnableSMS] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [blacklist, setBlacklist] = useState("");
  const fetchSMSData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(
        `${apiUrl.notifications}/notifications/sms/?order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSmsData(data.records || []);
      } else {
        toast.error("Failed to fetch SMS data");
      }
    } catch (error) {
      console.error("SMS fetch error:", error);
      toast.error("Error fetching SMS data");
    }
  }, [accessToken, apiUrl.notifications]);
  const fetchEmailData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(
        `${apiUrl.notifications}/notifications/email/?order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setEmailData(data.records || []);
      } else {
        toast.error("Failed to fetch Email data");
      }
    } catch (error) {
      console.error("Email fetch error:", error);
      toast.error("Error fetching Email data");
    }
  }, [accessToken, apiUrl.notifications]);
  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSMSData(), fetchEmailData()]);
    setLoading(false);
    toast.success("Data refreshed successfully");
  }, [fetchSMSData, fetchEmailData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshData, 2 * 60 * 1000); // 2 minutes
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
  }, [autoRefresh, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update pagination when pageSize changes
  useEffect(() => {
    if (smsGridApi) {
      smsGridApi.setGridOption("paginationPageSize", pageSize);
    }
    if (emailGridApi) {
      emailGridApi.setGridOption("paginationPageSize", pageSize);
    }
  }, [pageSize, smsGridApi, emailGridApi]);

  // Global search functionality
  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    if (smsGridApi) {
      smsGridApi.setGridOption("quickFilterText", value);
    }
    if (emailGridApi) {
      emailGridApi.setGridOption("quickFilterText", value);
    }
  };
  const smsColumnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      sortable: true,
      filter: true,
      cellClass: "font-medium text-center",
    },
    {
      headerName: "Mobile Number",
      field: "sms_to_phone_number",
      flex: 1,
      sortable: true,
      filter: true,
      cellClass: "font-medium",
    },
    {
      headerName: "Vendor",
      field: "sms_vendor",
      flex: 1,
      sortable: true,
      filter: true,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Status",
      field: "sms_delivery_status",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${params.value === "delivered" ? "bg-green-100 text-green-800" : params.value === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "No of Tries",
      field: "sms_num_retries",
      width: 120,
      sortable: true,
      filter: true,
      cellClass: "text-muted-foreground text-center",
    },
    {
      headerName: "Action",
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
      cellClass: ["flex", "items-center", "justify-center"],
    },
  ];
  const emailColumnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      sortable: true,
      filter: true,
      cellClass: "font-medium text-center",
    },
    {
      headerName: "Email ID",
      field: "email_to_address",
      flex: 1,
      sortable: true,
      filter: true,
      cellClass: "font-medium",
    },
    {
      headerName: "Vendor",
      field: "email_vendor",
      flex: 1,
      sortable: true,
      filter: true,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Status",
      field: "email_delivery_status",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${params.value === "delivered" ? "bg-green-100 text-green-800" : params.value === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "No of Tries",
      field: "email_num_retries",
      width: 120,
      sortable: true,
      filter: true,
      cellClass: "text-muted-foreground text-center",
    },
    {
      headerName: "Action",
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
      cellClass: ["flex", "items-center", "justify-center"],
    },
  ];
  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    cellClass: "flex items-center",
  };
  const onSmsGridReady = (params: GridReadyEvent) => {
    setSmsGridApi(params.api);
    params.api.setGridOption("paginationPageSize", pageSize);
  };
  const onEmailGridReady = (params: GridReadyEvent) => {
    setEmailGridApi(params.api);
    params.api.setGridOption("paginationPageSize", pageSize);
  };
  const handleSendSMS = () => {
    toast.info("Sending SMS...");
  };
  const handleSendEmail = () => {
    toast.info("Sending Email...");
  };
  const hasSMSData = smsData.length > 0;
  const hasEmailData = emailData.length > 0;
  return (
    <Layout title="Notification Centre" breadcrumb="Notifications">
      <div className="space-y-3 px-[4px]">
        {/* Compact Header Controls - RESPONSIVE VERSION */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            {/* Single Row Header for Desktop */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Title with Icons */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Centre</h2>
              </div>

              {/* Controls Row - Single line on desktop */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 w-full sm:min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchText}
                    onChange={onSearchChange}
                    className="pl-10 w-full"
                  />
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Auto Refresh */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
                      className="h-4 w-4 text-gray-300"
                    />
                    <Label
                      htmlFor="auto-refresh"
                      className="text-sm text-muted-foreground font-medium whitespace-nowrap"
                    >
                      Auto Refresh
                    </Label>
                  </div>

                  <Button onClick={refreshData} disabled={loading} variant="outline" size="sm" className="h-8 px-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden xs:inline ml-1">Refresh</span>
                  </Button>

                  <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="h-8 px-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden xs:inline ml-1">Settings</span>
                  </Button>

                  {/* Page Size Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">Show:</span>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Details Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">SMS Details</h2>
          </div>
          <div className="flex-1 w-full">
            {loading ? (
              <>
                <div className="hidden md:flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
                <div className="block md:hidden p-4">
                  <MobileCardSkeleton variant="notification" count={3} />
                </div>
              </>
            ) : hasSMSData ? (
              <>
                {/* Desktop view - AG Grid */}
                <div className="hidden md:block">
                  <div className="ag-theme-alpine h-96 w-full">
                    <AgGridReact
                      rowData={smsData}
                      columnDefs={smsColumnDefs}
                      defaultColDef={defaultColDef}
                      pagination={true}
                      paginationPageSize={pageSize}
                      paginationPageSizeSelector={[10, 25, 50, 100]}
                      onGridReady={onSmsGridReady}
                      domLayout="normal"
                      rowHeight={36}
                      headerHeight={38}
                      suppressCellFocus={true}
                      suppressRowClickSelection={true}
                      rowSelection="multiple"
                      enableRangeSelection={true}
                    />
                  </div>
                </div>

                {/* Mobile view - Cards */}
                <div className="block md:hidden">
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {smsData.map((sms) => (
                      <Card key={sms.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">ID: {sms.id}</div>
                              <div className="text-lg font-semibold mt-1">{sms.sms_to_phone_number}</div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${sms.sms_delivery_status === "delivered" ? "bg-green-100 text-green-800" : sms.sms_delivery_status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {sms.sms_delivery_status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="space-y-2 flex-1">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Vendor:</span> {sms.sms_vendor}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Retries:</span> {sms.sms_num_retries}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info(`Retrying SMS ${sms.id}`)}
                                className="text-xs"
                              >
                                Retry
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/notification/sms/${sms.id}`)}
                                className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No SMS data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Details Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Email Details</h2>
          </div>
          <div className="flex-1 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : hasEmailData ? (
              <>
                {/* Desktop view - AG Grid */}
                <div className="hidden md:block">
                  <div className="ag-theme-alpine h-96 w-full">
                    <AgGridReact
                      rowData={emailData}
                      columnDefs={emailColumnDefs}
                      defaultColDef={defaultColDef}
                      pagination={true}
                      paginationPageSize={pageSize}
                      paginationPageSizeSelector={[10, 25, 50, 100]}
                      onGridReady={onEmailGridReady}
                      domLayout="normal"
                      rowHeight={36}
                      headerHeight={38}
                      suppressCellFocus={true}
                      suppressRowClickSelection={true}
                      rowSelection="multiple"
                      enableRangeSelection={true}
                    />
                  </div>
                </div>

                {/* Mobile view - Cards */}
                <div className="block md:hidden">
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {emailData.map((email) => (
                      <Card key={email.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">ID: {email.id}</div>
                              <div className="text-lg font-semibold mt-1 truncate">{email.email_to_address}</div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${email.email_delivery_status === "delivered" ? "bg-green-100 text-green-800" : email.email_delivery_status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {email.email_delivery_status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="space-y-2 flex-1">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Vendor:</span> {email.email_vendor}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Retries:</span> {email.email_num_retries}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info(`Retrying Email ${email.id}`)}
                                className="text-xs"
                              >
                                Retry
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/notification/email/${email.id}`)}
                                className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No Email data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Vendor List Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor List</Label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="aws-ses">AWS SES</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSendSMS} className="flex-1">
                  Send SMS
                </Button>
                <Button onClick={handleSendEmail} className="flex-1">
                  Send Email
                </Button>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-sms">Enable SMS</Label>
                  <Switch id="enable-sms" checked={enableSMS} onCheckedChange={setEnableSMS} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-email">Enable Email</Label>
                  <Switch id="enable-email" checked={enableEmail} onCheckedChange={setEnableEmail} />
                </div>
              </div>

              {/* Blacklist */}
              <div className="space-y-2">
                <Label htmlFor="blacklist">Blacklist</Label>
                <Textarea
                  id="blacklist"
                  placeholder="Enter phone numbers or email addresses (one per line)"
                  value={blacklist}
                  onChange={(e) => setBlacklist(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};
export default NotificationsPage;
