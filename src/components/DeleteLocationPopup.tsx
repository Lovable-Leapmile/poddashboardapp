import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useToast } from "@/hooks/use-toast";

interface DeleteLocationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  locationName: string;
  onSuccess: () => void;
}

const DeleteLocationPopup: React.FC<DeleteLocationPopupProps> = ({ open, onOpenChange, locationId, locationName, onSuccess }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl.podcore}/locations/${locationId}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete location");

      toast({ title: "Success", description: "Location deleted successfully" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({ title: "Error", description: "Failed to delete location", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Location</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this location?</p>
            <p className="font-medium text-foreground">{locationName}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>No</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
            {loading ? "Deleting..." : "Yes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLocationPopup;
