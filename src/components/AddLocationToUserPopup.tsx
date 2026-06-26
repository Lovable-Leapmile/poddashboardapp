import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useApiUrl } from '@/hooks/useApiUrl';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';

interface Location {
  id: number;
  location_name: string;
  location_address?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface AddLocationToUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  onSuccess: () => void;
}

const AddLocationToUserPopup: React.FC<AddLocationToUserPopupProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>(userId ? userId.toString() : '');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) =>
      l.location_name?.toLowerCase().includes(q) ||
      l.location_address?.toLowerCase().includes(q) ||
      String(l.id).includes(q)
    );
  }, [locations, locationSearch]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken || !isOpen) return;
      
      try {
        setFetchingData(true);
        
        // Fetch both locations and users in parallel
        const [locationsResponse, usersResponse] = await Promise.all([
          fetch(`${apiUrl.podcore}/locations/?order_by_field=updated_at&order_by_type=DESC`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }),
          fetch(`${apiUrl.podcore}/users/?order_by_field=updated_at&order_by_type=DESC`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          })
        ]);
        
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          // API returns { records: [...] } format
          setLocations(locationsData.records || []);
        }
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // API returns { records: [...] } format
          setUsers(usersData.records || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [accessToken, apiUrl.podcore, isOpen]);

  // Update selected user when userId prop changes
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId.toString());
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!selectedLocationId) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      });
      return;
    }

    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl.podcore}/users/locations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(selectedUserId),
          location_id: parseInt(selectedLocationId)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Location added to user successfully"
        });
        onSuccess();
        onClose();
        setSelectedLocationId('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add location to user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding location to user:', error);
      toast({
        title: "Error",
        description: "Failed to add location to user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Location to User</DialogTitle>
          <DialogDescription>
            Select a location to add to this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* User Selection - only show if userId is not provided */}
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder={fetchingData ? "Loading users..." : "Select a user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location Selection — inline searchable list */}
          <div className="space-y-2">
            <Label htmlFor="location-search">Select Location</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="location-search"
                placeholder="Search location by name, address or ID..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-8"
                autoComplete="off"
              />
            </div>
            <div className="border rounded-md max-h-64 overflow-y-auto bg-background">
              {fetchingData ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Loading locations...
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No locations found
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredLocations.map((location) => {
                    const idStr = location.id.toString();
                    const selected = selectedLocationId === idStr;
                    return (
                      <li key={location.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedLocationId(idStr)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            selected ? 'bg-accent text-accent-foreground font-medium' : ''
                          }`}
                        >
                          <div className="truncate">{location.location_name}</div>
                          {location.location_address && (
                            <div className="text-xs text-muted-foreground truncate">
                              {location.location_address}
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground">ID: {location.id}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredLocations.length} of {locations.length} locations
              {selectedLocationId && ' • 1 selected'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedLocationId || !selectedUserId}
            className="w-full sm:w-auto bg-[#FDDC4E] hover:bg-yellow-400 text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Location'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationToUserPopup;
