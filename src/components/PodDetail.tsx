import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Eye, EyeOff, Edit, Trash2, Settings, ArrowUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, PodDetail as PodDetailType, LogEntry } from "@/services/dashboardApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NoDataIllustration from "@/components/ui/no-data-illustration";
import EditModePopup from "./EditModePopup";
import UpdatePodVersionPopup from "./UpdatePodVersionPopup";
import FEUpdatePopup from "./FEUpdatePopup";
import EditPodPopup from "./EditPodPopup";
import DeletePodPopup from "./DeletePodPopup";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useApiUrl } from "@/hooks/useApiUrl";
import { toast } from "sonner";

interface PodDetailProps {
  podId: number;
  onBack: () => void;
}

const PodDetail: React.FC<PodDetailProps> = ({ podId, onBack }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [podDetail, setPodDetail] = useState<PodDetailType | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [showEditModePopup, setShowEditModePopup] = useState(false);
  const [showUpdateVersionPopup, setShowUpdateVersionPopup] = useState(false);
  const [showFEUpdatePopup, setShowFEUpdatePopup] = useState(false);
  const [showEditPodPopup, setShowEditPodPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchPodDetail = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPodDetail(accessToken, podId);
      setPodDetail(data);
    } catch (error) {
      console.error("Error fetching pod detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (!accessToken) return;
    setLogsLoading(true);
    try {
      const data = await dashboardApi.getPodLogs(accessToken, podId);
      setLogs(data);
    } catch (error) {
      console.error("Error fetching pod logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodDetail();
    fetchLogs();
  }, [podId, accessToken]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "null" || value === "") {
      return "N/A";
    }
    return String(value);
  };

  const formatStatus = (status: string) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handlePopupSuccess = () => {
    fetchPodDetail();
  };

  if (!podDetail) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Pods</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Pod not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Pods</span>
        </Button>
      </div>

      {/* Pod Details Card */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-3 pt-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <img
                alt="Qikpod Logo"
                src="https://leapmile.com/assets/q35-DUPPwGYr.png"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-15 md:w-20 h-auto object-contain"
              />

              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center md:text-left">
                  {podDetail.pod_name}
                </CardTitle>

                {/* Pod Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">POD NAME:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_name)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">POD ID:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.id)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">TOTAL DOORS:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_numtotaldoors)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">LOCATION:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.location_name)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">CREATED AT:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.created_at)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">UPDATED AT:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.updated_at)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">PINGED AT:</span>
                    <span className="ml-1 text-gray-900">{formatValue(podDetail.pinged_at)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-600 font-medium">STATUS:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      podDetail.status?.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formatStatus(podDetail.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 items-center md:items-end">
              <Button
                variant="outline"
                className="rounded-lg text-xs md:text-sm h-8 px-2 w-full md:w-auto"
                onClick={() => setShowEditModePopup(true)}
              >
                Edit Mode
              </Button>
              <Button
                variant="outline"
                className="rounded-lg text-xs md:text-sm h-8 px-2 w-full md:w-auto"
                onClick={() => setShowEditPodPopup(true)}
              >
                <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="rounded-lg text-xs md:text-sm h-8 px-2 w-full md:w-auto"
                onClick={() => setShowDeletePopup(true)}
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs md:text-sm text-gray-600">Touchless</span>
                <Switch checked={podDetail.pod_touchless_enabled} className="scale-75 md:scale-100" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Pod Versions Section */}
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 text-center md:text-left">
              Pod Versions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm mb-3">
              <div className="truncate">
                <span className="text-gray-600 font-medium">HEALTH:</span>
                <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_health)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">STATE:</span>
                <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_state)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">POWER:</span>
                <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_power_status)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">CURRENT:</span>
                <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_production_version)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">TARGET:</span>
                <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_production_version_update_to)}</span>
              </div>
            </div>

            {/* Hide/Show Toggle */}
            <div className="mb-3 text-center md:text-left">
              <Button
                variant="ghost"
                onClick={() => setShowHiddenSection(!showHiddenSection)}
                className="flex items-center space-x-1 text-gray-600 mx-auto md:mx-0 h-8 text-xs"
              >
                {showHiddenSection ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showHiddenSection ? "See Less" : "See More"}</span>
              </Button>
            </div>

            {/* Additional Details (Hidden by default) */}
            {showHiddenSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm border-t pt-3">
                <div className="truncate">
                  <span className="text-gray-600 font-medium">MODE:</span>
                  <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_mode)}</span>
                </div>
                <div className="truncate">
                  <span className="text-gray-600 font-medium">CONFIGURATION VERSION:</span>
                  <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_configuration_version)}</span>
                </div>
                <div className="truncate">
                  <span className="text-gray-600 font-medium">ROOT VERSION:</span>
                  <span className="ml-1 text-gray-900">{formatValue(podDetail.pod_root_version)}</span>
                </div>
                <div className="truncate">
                  <span className="text-gray-600 font-medium">FE TAG:</span>
                  <span className="ml-1 text-gray-900">{formatValue(podDetail.fe_tag)}</span>
                </div>
                <div className="truncate">
                  <span className="text-gray-600 font-medium">FE DETAILS:</span>
                  <span className="ml-1 text-gray-900">{formatValue(podDetail.fe_details)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-3 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900 text-center md:text-left">Logs</CardTitle>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <Button
                variant="outline"
                className="rounded-lg text-xs md:text-sm h-8 px-2"
                onClick={() => setShowUpdateVersionPopup(true)}
              >
                <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Update Pod Version
              </Button>
              <Button
                variant="outline"
                className="rounded-lg text-xs md:text-sm h-8 px-2"
                onClick={() => setShowFEUpdatePopup(true)}
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                FE Update
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <NoDataIllustration title="No logs found" description="There are no logs available for this pod." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Log ID</TableHead>
                    <TableHead className="text-xs md:text-sm">Log Time</TableHead>
                    <TableHead className="text-xs md:text-sm">Log Type</TableHead>
                    <TableHead className="text-xs md:text-sm">Log Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell className="text-xs md:text-sm">{log.log_id}</TableCell>
                      <TableCell className="text-xs md:text-sm">{formatValue(log.updated_at)}</TableCell>
                      <TableCell className="text-xs md:text-sm">{formatValue(log.log_type)}</TableCell>
                      <TableCell className="text-xs md:text-sm">{formatValue(log.log_message)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popups */}
      <EditModePopup
        open={showEditModePopup}
        onOpenChange={setShowEditModePopup}
        podId={podId}
        initialValue={podDetail.pod_mode}
        onSuccess={handlePopupSuccess}
      />

      <UpdatePodVersionPopup
        open={showUpdateVersionPopup}
        onOpenChange={setShowUpdateVersionPopup}
        podId={podId}
        onSuccess={handlePopupSuccess}
      />

      <FEUpdatePopup
        open={showFEUpdatePopup}
        onOpenChange={setShowFEUpdatePopup}
        podId={podId}
        initialValues={{
          fe_tag: podDetail.fe_tag,
          fe_details: podDetail.fe_details,
        }}
        onSuccess={handlePopupSuccess}
      />

      <EditPodPopup
        open={showEditPodPopup}
        onOpenChange={setShowEditPodPopup}
        podData={podDetail}
        onSuccess={handlePopupSuccess}
      />
    </div>
  );
};

export default PodDetail;
