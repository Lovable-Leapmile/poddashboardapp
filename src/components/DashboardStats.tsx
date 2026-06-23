import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { MapPin, Package, Users, Calendar, Zap } from 'lucide-react';
import { usePodStats } from '@/hooks/usePodStats';

interface DashboardStatsProps {
  dashboardStats: {
    locations: number;
    pods: number;
    activePods: number;
    users: number;
    reservations: number;
  };
  statsLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboardStats,
  statsLoading,
}) => {
  const { podStats } = usePodStats();
  const navigate = useNavigate();

  const statsData = [
    {
      title: 'LOCATIONS',
      value: dashboardStats.locations.toString(),
      icon: MapPin,
      route: '/locations',
    },
    {
      title: 'PODS',
      value: podStats.total_pods.toString(),
      icon: Package,
      route: '/pods',
    },
    {
      title: 'ACTIVE PODS',
      value: podStats.active_pods.toString(),
      icon: Zap,
      route: '/pods',
    },
    {
      title: 'USERS',
      value: dashboardStats.users.toString(),
      icon: Users,
      route: '/users',
    },
    {
      title: 'RESERVATIONS',
      value: dashboardStats.reservations.toString(),
      icon: Calendar,
      route: '/reservations',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          onClick={() => navigate(stat.route)}
          className="bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer rounded-lg border border-gray-200 px-4 py-3 flex flex-col items-center justify-center text-center hover:border-[#FDDC4E]"
        >
          <div className="flex items-center gap-2 mb-1 justify-center">
            <stat.icon className="h-4 w-4 text-gray-800" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {stat.title}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {statsLoading ? '...' : stat.value}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
