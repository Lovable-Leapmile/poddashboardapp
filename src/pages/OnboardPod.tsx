import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "@/lib/api";
import { toast } from "sonner";

interface OnboardedPod {
  mac_id: string;
  pod_id: string;
  wifi_ssid: string;
  wifi_password: string;
  [key: string]: any;
}

const OnboardPodPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [macId, setMacId] = useState("");
  const [podId, setPodId] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [onboardedPods, setOnboardedPods] = useState<OnboardedPod[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const resetForm = () => {
    setMacId("");
    setPodId("");
    setWifiSsid("");
    setWifiPassword("");
    setEditIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!macId.trim() || !podId.trim() || !wifiSsid.trim() || !wifiPassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Validate mac_id format (XX:XX:XX:XX:XX pattern)
    const macRegex = /^([0-9A-Fa-f]{2}:){4}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(macId.trim())) {
      toast.error("Invalid MAC ID format. Use format like AA:BB:CC:DD:EE");
      return;
    }

    if (podId.trim().length > 20) {
      toast.error("Pod ID must be 20 characters or less");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = editIndex !== null;
      const url = isEdit
        ? `${apiUrls.podcore}/onboard/${encodeURIComponent(macId.trim())}`
        : `${apiUrls.podcore}/onboard/`;
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mac_id: macId.trim(),
          pod_id: podId.trim(),
          wifi_ssid: wifiSsid.trim(),
          wifi_password: wifiPassword.trim(),
        }),
      });

      const data = await response.json();

      if (data?.error) {
        toast.error(data.error);
      } else if (response.ok) {
        toast.success(isEdit ? "Pod updated successfully" : "Pod onboarded successfully");

        if (!isEdit && data?.mac_id && data?.pod_key) {
          // Fetch the pod details using GET API with mac_id and pod_key from POST response
          await fetchOnboardedPod(data.mac_id, data.pod_key);
        } else if (isEdit) {
          // For edit, update the existing entry in the table
          const podEntry: OnboardedPod = {
            mac_id: macId.trim(),
            pod_id: podId.trim(),
            wifi_ssid: wifiSsid.trim(),
            wifi_password: wifiPassword.trim(),
            ...data,
          };
          setOnboardedPods((prev) => {
            const updated = [...prev];
            updated[editIndex] = podEntry;
            return updated;
          });
        }
        resetForm();
      } else {
        toast.error(data?.message || "Failed to onboard pod");
      }
    } catch (error) {
      console.error("Error onboarding pod:", error);
      toast.error("Network error while onboarding pod");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchOnboardedPod = async (mac_id: string, pod_key: string) => {
    try {
      const response = await fetch(
        `${apiUrls.podcore}/onboard/?mac_id=${encodeURIComponent(mac_id)}&pod_key=${encodeURIComponent(pod_key)}`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Extract pod from response - handle various response structures
        let pod: OnboardedPod | null = null;
        if (Array.isArray(data) && data.length > 0) {
          pod = data[0];
        } else if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          pod = data.data[0];
        } else if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
          pod = data.results[0];
        } else if (data?.id) {
          pod = data;
        }
        if (pod) {
          setOnboardedPods((prev) => [...prev, pod!]);
        }
      }
    } catch (error) {
      console.error("Error fetching onboarded pod:", error);
    }
  };

  const handleEdit = (index: number) => {
    const pod = onboardedPods[index];
    setMacId(pod.mac_id);
    setPodId(pod.pod_id);
    setWifiSsid(pod.wifi_ssid);
    setWifiPassword(pod.wifi_password);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (index: number) => {
    const pod = onboardedPods[index];
    const podApiId = pod.id;
    if (!podApiId) {
      toast.error("No ID available for deletion");
      return;
    }
    try {
      const response = await fetch(`${apiUrls.podcore}/onboard/${encodeURIComponent(podApiId)}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        toast.success("Pod deleted successfully");
        setOnboardedPods((prev) => prev.filter((_, i) => i !== index));
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data?.error || data?.message || "Failed to delete pod");
      }
    } catch (error) {
      console.error("Error deleting pod:", error);
      toast.error("Network error while deleting pod");
    }
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to onboard pods.</p>
      </div>
    );
  }

  return (
    <Layout title="Onboard Pod" breadcrumb="Operations / Pods Management / Onboard Pod">
      <div className="w-full flex flex-col gap-6 animate-fade-in px-[4px]">
        {/* Back button */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/pods")}
            className="flex items-center gap-1 h-8 px-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pods
          </Button>
        </div>

        {/* Form Card */}
        <Card className="bg-white shadow-sm rounded-xl border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {editIndex !== null ? "Edit & Re-submit Pod" : "Onboard New Pod"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mac_id">MAC ID</Label>
                <Input
                  id="mac_id"
                  placeholder="AA:BB:CC:DD:EE"
                  value={macId}
                  onChange={(e) => setMacId(e.target.value.slice(0, 17))}
                  required
                  maxLength={17}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pod_id">Pod ID</Label>
                <Input
                  id="pod_id"
                  placeholder="1002222"
                  value={podId}
                  onChange={(e) => setPodId(e.target.value.slice(0, 20))}
                  required
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi_ssid">Wifi SSID</Label>
                <Input
                  id="wifi_ssid"
                  placeholder="WIFI_SSID"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value.slice(0, 50))}
                  required
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi_password">Wifi Password</Label>
                <Input
                  id="wifi_password"
                  placeholder="WIFI_PASSWORD"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value.slice(0, 50))}
                  required
                  maxLength={50}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-1"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : editIndex !== null ? "Update Pod" : "Onboard Pod"}
                </Button>
                {editIndex !== null && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Table */}
        {onboardedPods.length > 0 && (
          <Card className="bg-white shadow-sm rounded-xl border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Onboarded Pods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">ID</TableHead>
                      <TableHead className="whitespace-nowrap">MAC ID</TableHead>
                      <TableHead className="whitespace-nowrap">Pod ID</TableHead>
                      <TableHead className="whitespace-nowrap">Wifi SSID</TableHead>
                      <TableHead className="whitespace-nowrap">Wifi Password</TableHead>
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardedPods.map((pod, index) => (
                      <TableRow key={pod.id ?? index}>
                        <TableCell className="font-medium whitespace-nowrap">{pod.id ?? "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{pod.mac_id}</TableCell>
                        <TableCell className="whitespace-nowrap">{pod.pod_id}</TableCell>
                        <TableCell className="whitespace-nowrap">{pod.wifi_ssid}</TableCell>
                        <TableCell className="whitespace-nowrap">{pod.wifi_password}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(index)}
                              className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(index)}
                              className="h-8 w-8 p-0 transition-colors bg-gray-100 text-red-500 hover:bg-red-100 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OnboardPodPage;
