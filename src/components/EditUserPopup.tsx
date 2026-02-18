import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApiUrl } from "@/hooks/useApiUrl";
import { UserDetail } from "@/services/dashboardApi";

interface EditUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetail;
  onSuccess: () => void;
}

const EditUserPopup: React.FC<EditUserPopupProps> = ({ open, onOpenChange, user, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { podcore } = useApiUrl();
  const [formData, setFormData] = useState({
    user_type: "",
    user_name: "",
    user_email: "",
    user_phone: "",
    user_flatno: "",
    user_address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        user_type: user.user_type || "",
        user_name: user.user_name || "",
        user_email: user.user_email?.replace("@gmail.com", "") || "",
        user_phone: user.user_phone || "",
        user_flatno: user.user_flatno || "",
        user_address: user.user_address || "",
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !formData.user_name.trim() || formData.user_name.length > 100) return;

    setLoading(true);
    try {
      const response = await fetch(`${podcore}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: formData.user_name,
          user_type: formData.user_type,
          user_address: formData.user_address,
          user_flatno: formData.user_flatno,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, user_phone: numericValue }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_type">User Type</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, user_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="SiteAdmin">SiteAdmin</SelectItem>
                <SelectItem value="SiteSecurity">SiteSecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_name">Name</Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, user_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">Email</Label>
            <div className="flex">
              <div className="flex-1 bg-muted border rounded-l-md px-3 py-2 text-sm text-muted-foreground">
                {formData.user_email}
              </div>
              <div className="bg-muted border border-l-0 rounded-r-md px-3 py-2 text-sm text-muted-foreground">
                @gmail.com
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_phone">Phone</Label>
            <div className="bg-muted border rounded-md px-3 py-2 text-sm text-muted-foreground">
              {formData.user_phone}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_flatno">Flat No</Label>
            <Input
              id="user_flatno"
              value={formData.user_flatno}
              onChange={(e) => setFormData((prev) => ({ ...prev, user_flatno: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_address">Address / Company Name</Label>
            <Input
              id="user_address"
              value={formData.user_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, user_address: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Updating..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserPopup;
