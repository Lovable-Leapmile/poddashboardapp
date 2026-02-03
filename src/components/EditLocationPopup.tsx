import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { LocationDetail } from "@/services/dashboardApi";

interface EditLocationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  onSuccess: () => void;
}

const EditLocationPopup: React.FC<EditLocationPopupProps> = ({ open, onOpenChange, locationId, onSuccess }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<LocationDetail | null>(null);
  const [formData, setFormData] = useState({
    location_name: "",
    primary_name: "",
    secondary_fe: "",
    map_latitude: "",
    map_longitude: "",
    location_address: "",
    primary_contact: "",
    primary_bd: "",
    location_pincode: "",
    primary_fe: "",
    map_color: "",
  });

  const mapColorOptions = ["Red", "Green", "Yellow"];

  const fetchLocationData = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl.podcore}/locations/?record_id=${locationId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const locationDetail = data.records?.[0];
        if (locationDetail) {
          setOriginalData(locationDetail);
          setFormData({
            location_name: locationDetail.location_name || "",
            primary_name: locationDetail.primary_name || "",
            secondary_fe: locationDetail.secondary_fe || "",
            map_latitude: locationDetail.map_latitude || "",
            map_longitude: locationDetail.map_longitude || "",
            location_address: locationDetail.location_address || "",
            primary_contact: locationDetail.primary_contact || "",
            primary_bd: locationDetail.primary_bd || "",
            location_pincode: locationDetail.location_pincode || "",
            primary_fe: locationDetail.primary_fe || "",
            map_color: locationDetail.map_color || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      toast({
        title: "Error",
        description: "Failed to load location data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && locationId) {
      fetchLocationData();
    }
  }, [open, locationId, accessToken]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = () => {
    if (!originalData) return {};

    const changes: any = {};
    Object.keys(formData).forEach((key) => {
      const originalValue = originalData[key as keyof LocationDetail] || "";
      const currentValue = formData[key as keyof typeof formData];
      if (originalValue !== currentValue) {
        changes[key] = currentValue;
      }
    });
    return changes;
  };

  const handleSubmit = async () => {
    if (!accessToken) return;

    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      toast({
        title: "Info",
        description: "No changes detected",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl.podcore}/locations/${locationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(changedFields),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading location data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location Name</label>
            <Input
              value={formData.location_name}
              onChange={(e) => handleInputChange("location_name", e.target.value)}
              placeholder="Enter location name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Name</label>
            <Input
              value={formData.primary_name}
              onChange={(e) => handleInputChange("primary_name", e.target.value)}
              placeholder="Enter primary name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Secondary FE</label>
            <Input
              value={formData.secondary_fe}
              onChange={(e) => handleInputChange("secondary_fe", e.target.value)}
              placeholder="Enter secondary FE"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Map Latitude</label>
              <Input
                value={formData.map_latitude}
                onChange={(e) => handleInputChange("map_latitude", e.target.value)}
                placeholder="Enter latitude"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Map Longitude</label>
              <Input
                value={formData.map_longitude}
                onChange={(e) => handleInputChange("map_longitude", e.target.value)}
                placeholder="Enter longitude"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
            <Input
              value={formData.location_address}
              onChange={(e) => handleInputChange("location_address", e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Contact</label>
            <Input
              value={formData.primary_contact}
              onChange={(e) => handleInputChange("primary_contact", e.target.value)}
              placeholder="Enter primary contact"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary BD</label>
            <Input
              value={formData.primary_bd}
              onChange={(e) => handleInputChange("primary_bd", e.target.value)}
              placeholder="Enter primary BD"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Pincode</label>
            <Input
              value={formData.location_pincode}
              onChange={(e) => handleInputChange("location_pincode", e.target.value)}
              placeholder="Enter pincode"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary FE</label>
            <Input
              value={formData.primary_fe}
              onChange={(e) => handleInputChange("primary_fe", e.target.value)}
              placeholder="Enter primary FE"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Map Color</label>
            <Select value={formData.map_color} onValueChange={(value) => handleInputChange("map_color", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select map color" />
              </SelectTrigger>
              <SelectContent>
                {mapColorOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationPopup;
