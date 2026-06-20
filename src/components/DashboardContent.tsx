
import React from 'react';
import LocationsTable from './LocationsTable';
import PodsTable from './PodsTable';
import LocationDetail from './LocationDetail';
import PodDetail from './PodDetail';
import Reservations from './Reservations';
import ReservationDetail from './ReservationDetail';
import AdhocReservationDetail from './AdhocReservationDetail';
import UsersNetworkSection from './UsersNetworkSection';
import Partner from './Partner';
import DashboardStats from './DashboardStats';
import { ViewType } from './NavigationItems';

interface DashboardContentProps {
  currentView: ViewType;
  selectedLocationId: number | null;
  selectedPodId: number | null;
  selectedReservationId: number | null;
  dashboardStats: {
    locations: number;
    pods: number;
    activePods: number;
    users: number;
    reservations: number;
  };
  statsLoading: boolean;
  onLocationClick: (locationId: number) => void;
  onPodClick: (podId: number) => void;
  onStandardReservationClick: (reservationId: number) => void;
  onAdhocReservationClick: (reservationId: number) => void;
  onBackToLocations: () => void;
  onBackToPods: () => void;
  onBackToReservations: () => void;
  onBackToOperations: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  currentView,
  selectedLocationId,
  selectedPodId,
  selectedReservationId,
  dashboardStats,
  statsLoading,
  onLocationClick,
  onPodClick,
  onStandardReservationClick,
  onAdhocReservationClick,
  onBackToLocations,
  onBackToPods,
  onBackToReservations,
  onBackToOperations
}) => {
  switch (currentView) {
    case 'locations':
      return <LocationsTable onLocationClick={onLocationClick} isDashboard={false} />;
    case 'pods':
      return <PodsTable onPodClick={onPodClick} isDashboard={false} />;
    case 'reservations':
      return (
        <Reservations
          onBack={onBackToOperations}
          onStandardReservationClick={onStandardReservationClick}
          onAdhocReservationClick={onAdhocReservationClick}
        />
      );
    case 'usersNetwork':
      return <UsersNetworkSection onBack={onBackToOperations} />;
    case 'partner':
      return <Partner onBack={onBackToOperations} />;
    case 'locationDetail':
      return selectedLocationId ? (
        <LocationDetail locationId={selectedLocationId} onBack={onBackToLocations} />
      ) : null;
    case 'podDetail':
      return selectedPodId ? (
        <PodDetail podId={selectedPodId} onBack={onBackToPods} />
      ) : null;
    case 'reservationDetail':
      return selectedReservationId ? (
        <ReservationDetail reservationId={selectedReservationId} onBack={onBackToReservations} />
      ) : null;
    case 'adhocReservationDetail':
      return selectedReservationId ? (
        <AdhocReservationDetail reservationId={selectedReservationId} onBack={onBackToReservations} />
      ) : null;
    default:
      return (
        <div className="space-y-4">
          {/* Stats Cards */}
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />

          {/* Tables on Dashboard */}
          <div className="space-y-6">
            <LocationsTable onLocationClick={onLocationClick} isDashboard={true} />
            <PodsTable onPodClick={onPodClick} isDashboard={true} />
          </div>
        </div>
      );
  }
};

export default DashboardContent;
