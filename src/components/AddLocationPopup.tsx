import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";

interface AddLocationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddLocationPopup: React.FC<AddLocationPopupProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const apiUrl = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location_name: "",
    location_address: "",
    location_pincode: "",
    status: "active",
    location_state: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location_name.trim() || !formData.location_address.trim() || formData.location_name.length > 200 || formData.location_address.length > 500) {
      toast({
        title: "Error",
        description: "Location name and address are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl.podcore}/locations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create location");
      }

      toast({
        title: "Success",
        description: "Location created successfully",
      });

      // Reset form
      setFormData({
        location_name: "",
        location_address: "",
        location_pincode: "",
        status: "active",
        location_state: "",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating location:", error);
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_name">Location Name *</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => handleInputChange("location_name", e.target.value)}
              placeholder="e.g., Qikpod Tower1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Address *</Label>
            <Input
              id="location_address"
              value={formData.location_address}
              onChange={(e) => handleInputChange("location_address", e.target.value)}
              placeholder="e.g., C V Raman Nagar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_pincode">Pincode</Label>
            <Input
              id="location_pincode"
              value={formData.location_pincode}
              onChange={(e) => handleInputChange("location_pincode", e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="e.g., 560093"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_state">State</Label>
            <Input
              id="location_state"
              value={formData.location_state}
              onChange={(e) => handleInputChange("location_state", e.target.value)}
              placeholder="e.g., Karnataka"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationPopup;
