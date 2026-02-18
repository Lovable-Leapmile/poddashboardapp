import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, RotateCcw } from "lucide-react";

interface CreateUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  onSuccess: () => void;
}

const CreateUserPopup: React.FC<CreateUserPopupProps> = ({ open, onOpenChange, locationId, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    userType: "",
    email: "@gmail.com",
    phone: "",
    address: "",
    flatNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userTypeOptions = ["QPStaff", "Customer", "SiteSecurity", "SiteAdmin", "DeliveryExec"];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    // Allow only alphabets and spaces, max 100 chars
    const alphabetOnly = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 100);
    handleInputChange("name", alphabetOnly);
  };

  const handlePhoneChange = (value: string) => {
    // Allow only numerics, max 10 digits
    const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
    handleInputChange("phone", numericOnly);
  };

  const handleFlatNoChange = (value: string) => {
    // Allow only numerics, max 10 chars
    const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
    handleInputChange("flatNo", numericOnly);
  };

  const handleEmailChange = (value: string) => {
    // Ensure it always ends with @gmail.com
    let emailValue = value;
    if (!emailValue.includes("@gmail.com")) {
      emailValue = emailValue.replace(/@.*$/, "") + "@gmail.com";
    }
    handleInputChange("email", emailValue);
  };

  const clearAll = () => {
    setFormData({
      name: "",
      userType: "",
      email: "@gmail.com",
      phone: "",
      address: "",
      flatNo: "",
    });
  };

  const handleSubmit = async () => {
    if (!accessToken || !formData.name.trim() || !formData.userType || !formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First create the user
      const baseUrl = localStorage.getItem("api_base_url")?.replace("/podcore", "") || "https://productionv36.qikpod.com";
      const createResponse = await fetch(`${baseUrl}/podcore/users/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_phone: formData.phone,
          user_name: formData.name,
          user_type: formData.userType,
          user_flatno: formData.flatNo || "1234",
          user_email: formData.email,
          user_address: formData.address || "N/A",
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create user");
      }

      const newUser = await createResponse.json();
      
      // Then associate the user with the location
      const associateResponse = await fetch(`${baseUrl}/podcore/users/locations/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: newUser.id,
          location_id: locationId,
        }),
      });

      if (!associateResponse.ok) {
        console.warn("User created but failed to associate with location");
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });
      onSuccess();
      onOpenChange(false);
      clearAll();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Name *</label>
            <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter name" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">User Type *</label>
            <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="username@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Flat No</label>
            <Input
              value={formData.flatNo}
              onChange={(e) => handleFlatNoChange(e.target.value)}
              placeholder="Enter flat number"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
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

export default CreateUserPopup;
