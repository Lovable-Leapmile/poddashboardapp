
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dashboardApi } from '@/services/dashboardApi';
import SupportPopup from './SupportPopup';
import DashboardNavigation from './DashboardNavigation';
import DashboardContent from './DashboardContent';
import { ViewType, createNavigationItems } from './NavigationItems';

const Dashboard = () => {
  const { user, logout, accessToken } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    locations: 0,
    pods: 0,
    activePods: 0,
    users: 0,
    reservations: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const fetchDashboardStats = async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    try {
      const [locations, pods, activePods, users, reservations] = await Promise.all([
        dashboardApi.getLocationsCount(accessToken),
        dashboardApi.getPodsCount(accessToken),
        dashboardApi.getActivePodsCount(accessToken),
        dashboardApi.getUsersCount(accessToken),
        dashboardApi.getReservationsCount(accessToken)
      ]);
      setDashboardStats({
        locations,
        pods,
        activePods,
        users,
        reservations
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [accessToken]);

  const handleNavigationClick = (view: ViewType, onClick?: () => void) => {
    if (onClick) onClick();
    
    // Navigate to appropriate route
    switch (view) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'locations':
        navigate('/locations');
        break;
      case 'pods':
        navigate('/pods');
        break;
      case 'reservations':
        navigate('/reservations');
        break;
      case 'usersNetwork':
        navigate('/users');
        break;
      case 'partner':
        navigate('/partner');
        break;
      case 'notification':
        navigate('/notification');
        break;
      default:
        setCurrentView(view);
        break;
    }
    setIsMobileMenuOpen(false);
  };

  const navigationItems = createNavigationItems(currentView, handleNavigationClick, setShowSupportPopup);

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };

  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };

  const handleStandardReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('reservationDetail');
  };

  const handleAdhocReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('adhocReservationDetail');
  };

  const handleBackToLocations = () => {
    setCurrentView('locations');
    setSelectedLocationId(null);
  };

  const handleBackToPods = () => {
    setCurrentView('pods');
    setSelectedPodId(null);
  };

  const handleBackToReservations = () => {
    setCurrentView('reservations');
    setSelectedReservationId(null);
  };

  const handleBackToOperations = () => {
    setCurrentView('dashboard');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'locations':
        return 'Locations';
      case 'pods':
        return 'Pods';
      case 'reservations':
        return 'Reservations';
      case 'usersNetwork':
        return 'Users';
      case 'partner':
        return 'Partner';
      case 'locationDetail':
        return 'Location Details';
      case 'podDetail':
        return 'Pod Details';
      case 'reservationDetail':
        return 'Reservation Details';
      case 'adhocReservationDetail':
        return 'Adhoc Reservation Details';
      default:
        return 'Dashboard';
    }
  };

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'locations':
        return 'Operations / Locations Management';
      case 'pods':
        return 'Operations / Pods Management';
      case 'reservations':
        return 'Operations / Reservations Management';
      case 'usersNetwork':
        return 'Users & Network / Users Management';
      case 'partner':
        return 'Users & Network / Partner Management';
      case 'locationDetail':
        return 'Operations / Location Details';
      case 'podDetail':
        return 'Operations / Pod Details';
      case 'reservationDetail':
        return 'Operations / Reservation Details';
      case 'adhocReservationDetail':
        return 'Operations / Adhoc Reservation Details';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Fixed Top Navigation */}
      <DashboardNavigation
        navigationItems={navigationItems}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setShowLogoutDialog={setShowLogoutDialog}
      />

      {/* Main Content with top padding for fixed header */}
      <main className="w-full py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            {getBreadcrumb()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          {user && currentView === 'dashboard' && (
            <p className="text-gray-600 mt-1">Welcome back, {user.user_name}!</p>
          )}
        </div>

        {/* Dynamic Content */}
        <DashboardContent
          currentView={currentView}
          selectedLocationId={selectedLocationId}
          selectedPodId={selectedPodId}
          selectedReservationId={selectedReservationId}
          dashboardStats={dashboardStats}
          statsLoading={statsLoading}
          onLocationClick={handleLocationClick}
          onPodClick={handlePodClick}
          onStandardReservationClick={handleStandardReservationClick}
          onAdhocReservationClick={handleAdhocReservationClick}
          onBackToLocations={handleBackToLocations}
          onBackToPods={handleBackToPods}
          onBackToReservations={handleBackToReservations}
          onBackToOperations={handleBackToOperations}
        />
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Popup */}
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
    </div>
  );
};

export default Dashboard;
