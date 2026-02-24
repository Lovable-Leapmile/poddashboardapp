import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Search, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "@/lib/api";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface OnboardedPod {
  id?: number | string;
  mac_id: string;
  pod_id: string;
  wifi_ssid: string;
  wifi_password: string;
  [key: string]: any;
}

const OnboardPodPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [macId, setMacId] = useState("");
  const [podId, setPodId] = useState("");
  const [doors, setDoors] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Search state
  const [searchPodId, setSearchPodId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OnboardedPod[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const resetForm = () => {
    setMacId("");
    setPodId("");
    setDoors("");
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
          doors: doors.trim(),
          wifi_ssid: wifiSsid.trim(),
          wifi_password: wifiPassword.trim(),
        }),
      });

      const data = await response.json();
      console.log("Onboard API response:", JSON.stringify(data));

      if (data?.error) {
        toast.error(data.error);
      } else if (response.ok) {
        toast.success(isEdit ? "Pod updated successfully" : "Pod onboarded successfully");
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

  const handleSearch = async () => {
    if (!searchPodId.trim()) {
      toast.error("Please enter a Pod ID to search");
      return;
    }
    setSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `${apiUrls.podcore}/onboard/list/?pod_id=${encodeURIComponent(searchPodId.trim())}`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      console.log("Search API response:", JSON.stringify(data));

      if (response.ok) {
        const records = Array.isArray(data) ? data : data?.records ?? data?.data ?? (data?.id ? [data] : []);
        setSearchResults(records);
        if (records.length === 0) {
          toast.info("No onboarded pods found for this Pod ID");
        }
      } else {
        setSearchResults([]);
        toast.error(data?.message || data?.error || "No records found");
      }
    } catch (error) {
      console.error("Error searching pods:", error);
      toast.error("Network error while searching");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleEditFromSearch = (pod: OnboardedPod) => {
    setMacId(pod.mac_id);
    setPodId(pod.pod_id);
    setWifiSsid(pod.wifi_ssid);
    setWifiPassword(pod.wifi_password);
    setEditIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteOnboard = async (pod: OnboardedPod) => {
    if (!pod.id) {
      toast.error("No ID available for deletion");
      return;
    }
    try {
      const response = await fetch(`${apiUrls.podcore}/onboard/${encodeURIComponent(pod.id)}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        toast.success("Pod deleted successfully");
        setSearchResults((prev) => prev.filter((p) => p.id !== pod.id));
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
                <Label htmlFor="doors">Number of Doors</Label>
                <Input
                  id="doors"
                  type="number"
                  placeholder="7"
                  value={doors}
                  onChange={(e) => setDoors(e.target.value)}
                  required
                  min={1}
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

        {/* Search Section */}
        <Card className="bg-card shadow-sm rounded-xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Search Onboarded Pod
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search_pod_id">Pod ID</Label>
                <Input
                  id="search_pod_id"
                  placeholder="Enter Pod ID to search"
                  value={searchPodId}
                  onChange={(e) => setSearchPodId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-1 h-10"
              >
                <Search className="h-4 w-4" />
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && searchResults.length > 0 && (
          <Card className="bg-card shadow-sm rounded-xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="flex flex-col gap-3">
                  {searchResults.map((pod, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">ID</span>
                          <span className="font-semibold">{pod.id ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">MAC ID</span>
                          <span>{pod.mac_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Pod ID</span>
                          <span>{pod.pod_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Wifi SSID</span>
                          <span>{pod.wifi_ssid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Wifi Password</span>
                          <span>{pod.wifi_password}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFromSearch(pod)}
                          className="h-8 flex-1 transition-colors bg-muted text-muted-foreground hover:bg-[#FDDC4E] hover:text-black"
                        >
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOnboard(pod)}
                          className="h-8 flex-1 transition-colors bg-muted text-red-500 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>MAC ID</TableHead>
                      <TableHead>Pod ID</TableHead>
                      <TableHead>Wifi SSID</TableHead>
                      <TableHead>Wifi Password</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((pod, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{pod.id ?? "-"}</TableCell>
                        <TableCell>{pod.mac_id}</TableCell>
                        <TableCell>{pod.pod_id}</TableCell>
                        <TableCell>{pod.wifi_ssid}</TableCell>
                        <TableCell>{pod.wifi_password}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFromSearch(pod)}
                              className="h-8 w-8 p-0 transition-colors bg-muted text-muted-foreground hover:bg-[#FDDC4E] hover:text-black"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOnboard(pod)}
                              className="h-8 w-8 p-0 transition-colors bg-muted text-red-500 hover:bg-red-100 hover:text-red-700"
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
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OnboardPodPage;
