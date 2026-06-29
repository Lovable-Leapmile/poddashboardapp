
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

interface EditModePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podId: number;
  initialValue?: string;
  onSuccess: () => void;
}

const EditModePopup: React.FC<EditModePopupProps> = ({
  open,
  onOpenChange,
  podId,
  initialValue,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState(initialValue || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accessToken || !selectedMode) return;

    setLoading(true);
    try {
      await dashboardApi.updatePodMode(accessToken, podId, selectedMode);
      toast({
        title: "Success",
        description: "Pod mode updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating pod mode:', error);
      toast({
        title: "Error",
        description: "Failed to update pod mode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pod Mode</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adhoc">adhoc</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedMode}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Update'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditModePopup;
