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
import { toast } from "sonner";

interface DeletePodPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podId: number;
  podName: string;
  onSuccess: () => void;
}

const DeletePodPopup: React.FC<DeletePodPopupProps> = ({ open, onOpenChange, podId, podName, onSuccess }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl.podcore}/pods/${podId}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete pod");

      toast.success("Pod deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting pod:", error);
      toast.error(error.message || "Failed to delete pod");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Pod</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this pod?</p>
            <p className="font-medium text-foreground">{podName}</p>
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

export default DeletePodPopup;
