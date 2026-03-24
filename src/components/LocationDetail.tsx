import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, Package, Eye, EyeOff, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, LocationDetail as LocationDetailType } from "@/services/dashboardApi";
import LocationReservationsTable from "./LocationReservationsTable";
import LocationPodsTable from "./LocationPodsTable";
import LocationUsersTable from "./LocationUsersTable";
import AssignFeBdPopup from "./AssignFeBdPopup";
import CreateUserPopup from "./CreateUserPopup";
import PaymentModePopup from "./PaymentModePopup";
import EditLocationPopup from "./EditLocationPopup";
import DeleteLocationPopup from "./DeleteLocationPopup";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useToast } from "@/hooks/use-toast";

interface LocationDetailProps {
  locationId: number;
  onBack: () => void;
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
  onPodClick?: (podId: number) => void;
  onUserClick?: (userId: number) => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({
  locationId,
  onBack,
  onStandardReservationClick,
  onAdhocReservationClick,
  onPodClick,
  onUserClick,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const apiUrl = useApiUrl();
  const [locationDetail, setLocationDetail] = useState<LocationDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [showAssignFeBdPopup, setShowAssignFeBdPopup] = useState(false);
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [showPaymentModePopup, setShowPaymentModePopup] = useState(false);
  const [showEditLocationPopup, setShowEditLocationPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchLocationDetail = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationDetail(accessToken, locationId);
      setLocationDetail(data);
    } catch (error) {
      console.error("Error fetching location detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationDetail();
  }, [locationId, accessToken]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "null" || value === "") {
      return "N/A";
    }
    return String(value);
  };

  const handlePopupSuccess = () => {
    fetchLocationDetail();
  };

  // Delete is now handled by DeleteLocationPopup

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Locations</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (!locationDetail) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Locations</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-4">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" size="sm" className="flex items-center gap-2 mb-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Locations
      </Button>

      {/* Location Details Card - Made more compact */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg md:text-xl font-bold text-gray-900 mb-3">
            Location Details: {locationDetail.location_name}
          </CardTitle>

          {/* Details Grid - More compact layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {/* Row 1 */}
            <div className="truncate">
              <span className="text-gray-600 font-medium">PRIMARY NAME:</span>
              <span className="ml-1 text-gray-900">{formatValue(locationDetail.primary_name)}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-600 font-medium">CONTACT:</span>
              <span className="ml-1 text-gray-900">{formatValue(locationDetail.primary_contact)}</span>
            </div>

            {/* Row 2 */}
            <div className="truncate">
              <span className="text-gray-600 font-medium">PINCODE:</span>
              <span className="ml-1 text-gray-900">{formatValue(locationDetail.location_pincode)}</span>
            </div>
            {/*<div className="truncate">
              <span className="text-gray-600 font-medium">RESERVATIONS:</span>
              <span className="ml-1 text-gray-900">338</span>
            </div>*/}

            {/* Row 3 */}
            {/*<div className="truncate">
              <span className="text-gray-600 font-medium">PODS:</span>
              <span className="ml-1 text-gray-900">0</span>
            </div>
            <div className="truncate">
              <span className="text-gray-600 font-medium">USERS:</span>
              <span className="ml-1 text-gray-900">114</span>
            </div>*/}

            {/* Row 4 */}
            <div className="truncate md:col-span-2">
              <span className="text-gray-600 font-medium">PAYMENT MODE:</span>
              <span className="ml-1 text-gray-900">{formatValue(locationDetail.payment_mode)}</span>
            </div>

            {/* Row 5 */}
            <div className="truncate md:col-span-2">
              <span className="text-gray-600 font-medium">ADDRESS:</span>
              <span className="ml-1 text-gray-900 text-xs md:text-sm">
                {formatValue(locationDetail.location_address)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Action Buttons - Made more compact */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-3 justify-center md:justify-start">
            <Button
              variant="outline"
              className="rounded-lg text-xs md:text-sm h-8 px-2"
              onClick={() => setShowAssignFeBdPopup(true)}
            >
              Assign FE/BD
            </Button>
            <Button
              variant="outline"
              className="rounded-lg text-xs md:text-sm h-8 px-2"
              onClick={() => setShowCreateUserPopup(true)}
            >
              Create User
            </Button>
            <Button
              variant="outline"
              className="rounded-lg text-xs md:text-sm h-8 px-2"
              onClick={() => setShowPaymentModePopup(true)}
            >
              Payment Mode
            </Button>
            <Button
              variant="outline"
              className="rounded-lg text-xs md:text-sm h-8 px-2"
              onClick={() => setShowEditLocationPopup(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg text-xs md:text-sm h-8 px-2"
              onClick={() => setShowDeletePopup(true)}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>

          {/* Hide/Show Toggle */}
          <div className="mb-3 text-center md:text-left">
            <Button
              variant="ghost"
              onClick={() => setShowHiddenSection(!showHiddenSection)}
              className="flex items-center space-x-1 text-gray-600 mx-auto md:mx-0 h-8 text-xs"
            >
              {showHiddenSection ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showHiddenSection ? "Hide" : "Show More Details"}</span>
            </Button>
          </div>

          {/* Additional Details (Hidden by default) - Made more compact */}
          {showHiddenSection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm border-t pt-3">
              <div className="truncate">
                <span className="text-gray-600 font-medium">STATUS:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.status)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">PRIMARY FE:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.primary_fe)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">PRIMARY BD:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.primary_bd)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">SECONDARY NAME:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.secondary_name)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">SECONDARY FE:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.secondary_fe)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">SECONDARY CONTACT:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.secondary_contact)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">LATITUDE:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.map_latitude)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">LONGITUDE:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.map_longitude)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">STATE:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.location_state)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">DOCS STATUS:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.docs_status)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">BD TAG:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.bd_tag)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">BD DETAILS:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.bd_details)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">CREATED AT:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.created_at)}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-600 font-medium">UPDATED AT:</span>
                <span className="ml-1 text-gray-900">{formatValue(locationDetail.updated_at)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pods Table */}
      <LocationPodsTable locationId={locationId} onPodClick={onPodClick} />

      {/* Users Table */}
      <LocationUsersTable locationId={locationId} onUserClick={onUserClick} />

      {/* Reservations Tables */}
      <LocationReservationsTable
        locationId={locationId}
        onStandardReservationClick={onStandardReservationClick}
        onAdhocReservationClick={onAdhocReservationClick}
      />

      {/* Popups */}
      <AssignFeBdPopup
        open={showAssignFeBdPopup}
        onOpenChange={setShowAssignFeBdPopup}
        locationId={locationId}
        initialValues={{
          primary_fe: locationDetail.primary_fe,
          secondary_fe: locationDetail.secondary_fe,
          primary_bd: locationDetail.primary_bd,
        }}
        onSuccess={handlePopupSuccess}
      />

      <CreateUserPopup
        open={showCreateUserPopup}
        onOpenChange={setShowCreateUserPopup}
        locationId={locationId}
        onSuccess={handlePopupSuccess}
      />

      <PaymentModePopup
        open={showPaymentModePopup}
        onOpenChange={setShowPaymentModePopup}
        locationId={locationId}
        initialValue={locationDetail.payment_mode}
        onSuccess={handlePopupSuccess}
      />

      <EditLocationPopup
        open={showEditLocationPopup}
        onOpenChange={setShowEditLocationPopup}
        locationId={locationId}
        onSuccess={handlePopupSuccess}
      />
      <DeleteLocationPopup
        open={showDeletePopup}
        onOpenChange={setShowDeletePopup}
        locationId={locationId}
        locationName={locationDetail?.location_name || String(locationId)}
        onSuccess={onBack}
      />
    </div>
  );
};

export default LocationDetail;
