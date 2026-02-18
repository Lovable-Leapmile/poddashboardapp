import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Edit2 } from "lucide-react";
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
      const response = await fetch(`${apiUrls.podcore}/onboard/`, {
        method: "POST",
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

      if (response.ok) {
        toast.success("Pod onboarded successfully");
        const podEntry: OnboardedPod = {
          mac_id: macId.trim(),
          pod_id: podId.trim(),
          wifi_ssid: wifiSsid.trim(),
          wifi_password: wifiPassword.trim(),
          ...data,
        };

        if (editIndex !== null) {
          setOnboardedPods((prev) => {
            const updated = [...prev];
            updated[editIndex] = podEntry;
            return updated;
          });
        } else {
          setOnboardedPods((prev) => [...prev, podEntry]);
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

  const handleEdit = (index: number) => {
    const pod = onboardedPods[index];
    setMacId(pod.mac_id);
    setPodId(pod.pod_id);
    setWifiSsid(pod.wifi_ssid);
    setWifiPassword(pod.wifi_password);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>MAC ID</TableHead>
                    <TableHead>Pod ID</TableHead>
                    <TableHead>Wifi SSID</TableHead>
                    <TableHead>Wifi Password</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardedPods.map((pod, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{pod.mac_id}</TableCell>
                      <TableCell>{pod.pod_id}</TableCell>
                      <TableCell>{pod.wifi_ssid}</TableCell>
                      <TableCell>{pod.wifi_password}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(index)}
                          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OnboardPodPage;
