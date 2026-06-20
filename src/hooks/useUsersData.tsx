
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, User } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

export const useUsersData = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      // Fetch full dataset so search works globally, not just within current page
      const userData = await dashboardApi.getUsers(accessToken, 10000);
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  return {
    users,
    loading,
    refetchUsers: fetchUsers,
  };
};
