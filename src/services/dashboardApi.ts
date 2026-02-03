import { apiUrls } from "@/lib/api";

interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  records: T[];
  total_records?: number;
  total_count?: number;
}

interface Location {
  id: number;
  primary_name: string;
  location_name: string;
  location_address: string;
  location_pincode: string;
}

interface LocationDetail {
  id: number;
  status: string | null;
  created_at: string;
  updated_at: string;
  location_name: string;
  primary_name: string;
  primary_fe: string | null;
  primary_contact: string;
  primary_bd: string | null;
  secondary_name: string | null;
  secondary_fe: string | null;
  secondary_contact: string;
  map_latitude: string;
  map_longitude: string;
  location_address: string;
  location_pincode: string;
  location_state: string | null;
  map_text: string;
  map_color: string | null;
  docs_status: string | null;
  primary_fe_contact: string | null;
  bd_tag: string | null;
  bd_details: string | null;
  payment_mode: string;
}

interface Pod {
  id: number;
  pod_name: string;
  pod_power_status: string;
  status: string;
  pod_health: string;
  pod_numtotaldoors: number;
  location_name: string;
}

interface PodDetail {
  id: number;
  pod_name: string;
  pod_numtotaldoors: number;
  location_name: string;
  created_at: string;
  updated_at: string;
  pinged_at: string;
  pod_health: string;
  pod_state: string;
  pod_power_status: string;
  pod_production_version: string;
  pod_production_version_update_to: string;
  pod_touchless_enabled: boolean;
  status: string;
  pod_mode: string;
  pod_configuration_version: string;
  pod_root_version: string;
  fe_tag: string;
  fe_details: string;
  pod_flag_maintenance?: string | null;
  pod_connection_method?: string;
}

interface LogEntry {
  log_id: number;
  updated_at: string;
  log_type: string;
  log_message: string;
}

interface User {
  id: number;
  user_name: string;
  user_phone: string;
  user_type?: string;
  user_email?: string;
  user_flatno?: string;
  created_at?: string;
}

interface Reservation {
  id: number;
  reservation_status: string;
}

interface PodStats {
  total_pods: number;
  certified_pods: number;
  unregistered_pods: number;
  green_pods: number;
  red_pods: number;
  yellow_pods: number;
  active_pods: number;
  inactive_pods: number;
}

interface PodMonitorResponse {
  status: string;
  status_code: number;
  message: string;
  count: number;
}

interface StandardReservation {
  id: number;
  drop_by_name: string;
  location_name: string;
  created_by_name: string;
  status: string;
  created_at: string;
}

interface AdhocReservation {
  id: number;
  pod_name: string;
  user_phone: string;
  drop_time: string;
  pickup_time: string;
  rto_picktime: string;
  reservation_status: string;
}

interface StandardReservationDetail {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  drop_by_name: string;
  drop_by_phone: string;
  pickup_by_name: string;
  pickup_by_phone: string;
  location_name: string;
  created_by_name: string;
  created_by_phone: string;
  drop_otp: string;
  pickup_otp: string;
  payment_mode: string;
  payment_amount: number;
  payment_status: string;
  notes: string;
  reservation_type: string;
  location_id: number;
  user_id: number;
  created_by_user_id: number;
}

interface AdhocReservationDetail {
  id: number;
  reservation_status: string;
  created_at: string;
  updated_at: string;
  pod_name: string;
  user_phone: string;
  drop_time: string;
  pickup_time: string;
  rto_picktime: string;
  drop_otp: string;
  pickup_otp: string;
  rto_otp: string;
  payment_mode: string;
  payment_amount: number;
  payment_status: string;
  notes: string;
  location_id: number;
  pod_id: number;
  user_id: number;
}

interface CreateUserData {
  user_name: string;
  user_type: string;
  user_phone: string;
  user_email: string;
  user_flatno: string;
  location_address: string;
}

interface UserDetail {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  user_token: string | null;
  user_otp: string;
  user_otp_expiry_at: string;
  user_address: string | null;
  merchant_type: string;
  user_type: string;
  sub_type: string | null;
  user_flatno: string | null;
  user_uniqueid: string | null;
  user_dropcode: string;
  user_pickupcode: string;
  user_credit_limit: string;
  user_credit_used: string;
  location_address?: string;
}

interface UserLocation {
  id: number;
  location_name: string;
  location_address: string;
  primary_name: string;
  primary_contact: string;
  location_pincode: string;
}

interface UserReservation {
  id: number;
  reservation_status: string;
  created_at: string;
  drop_by_name: string;
  location_name: string;
  created_by_name: string;
  status: string;
}

// Dynamic base URL getter using centralized config
const getBaseUrl = () => apiUrls.podcore;

const getLogsBaseUrl = () => `${apiUrls.base}/`;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
});

export const dashboardApi = {
  // Count APIs
  getLocationsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/locations/?num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Location> = await response.json();
    return data.total_count || data.total_records || 0;
  },

  getPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/pods/?num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Pod> = await response.json();
    return data.total_count || data.total_records || 0;
  },

  getUsersCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/users/?order_by_field=updated_at&order_by_type=DESC&num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<User> = await response.json();
    return data.total_count || data.total_records || 0;
  },

  getReservationsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/reservations/?num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Reservation> = await response.json();
    return data.total_count || data.total_records || 0;
  },

  // Pod Statistics APIs
  getPodStats: async (token: string): Promise<PodStats> => {
    const response = await fetch(`${getBaseUrl()}/pods/?order_by_field=updated_at&order_by_type=DESC`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<PodDetail> = await response.json();
    const pods = data.records || [];

    return {
      total_pods: pods.length,
      certified_pods: pods.filter((pod) => pod.pod_state === "Certified" || pod.pod_state === "certified").length,
      unregistered_pods: pods.filter((pod) => pod.pod_state === "Unregistered" || pod.pod_state === "unregistered")
        .length,
      green_pods: pods.filter((pod) => pod.pod_health === "Green" || pod.pod_health === "green").length,
      red_pods: pods.filter((pod) => pod.pod_health === "Red" || pod.pod_health === "red").length,
      yellow_pods: pods.filter((pod) => pod.pod_health === "Yellow" || pod.pod_health === "yellow").length,
      active_pods: pods.filter((pod) => pod.status === "active").length,
      inactive_pods: pods.filter((pod) => pod.status === "inactive").length,
    };
  },

  getAlertPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/pods/pod_monitor/?pod_type=field_alert_pods`, {
      headers: getAuthHeaders(token),
    });
    const data: PodMonitorResponse = await response.json();
    return data.count || 0;
  },

  getReservationPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/pods/pod_monitor/?pod_type=alert_pods_reservation`, {
      headers: getAuthHeaders(token),
    });
    const data: PodMonitorResponse = await response.json();
    return data.count || 0;
  },

  getFieldPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/pods/pod_monitor/?pod_type=field_pods`, {
      headers: getAuthHeaders(token),
    });
    const data: PodMonitorResponse = await response.json();
    return data.count || 0;
  },

  getIgnorePodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/pods/pod_monitor/?pod_type=field_ignored_pods`, {
      headers: getAuthHeaders(token),
    });
    const data: PodMonitorResponse = await response.json();
    return data.count || 0;
  },

  // Data APIs
  getLocations: async (token: string, numRecords: number = 100): Promise<Location[]> => {
    const response = await fetch(`${getBaseUrl()}/locations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Location> = await response.json();
    return data.records || [];
  },

  getPods: async (token: string, numRecords: number = 100): Promise<Pod[]> => {
    const response = await fetch(`${getBaseUrl()}/pods/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Pod> = await response.json();
    return data.records || [];
  },

  getUsers: async (token: string, numRecords: number = 100): Promise<User[]> => {
    const response = await fetch(`${getBaseUrl()}/users/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<User> = await response.json();
    return data.records || [];
  },

  getReservations: async (token: string, numRecords: number = 100): Promise<Reservation[]> => {
    const response = await fetch(`${getBaseUrl()}/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Reservation> = await response.json();
    return data.records || [];
  },

  // New Reservation APIs
  getStandardReservations: async (token: string, numRecords: number = 100): Promise<StandardReservation[]> => {
    const response = await fetch(`${getBaseUrl()}/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<StandardReservation> = await response.json();
    return data.records || [];
  },

  getAdhocReservations: async (token: string, numRecords: number = 100): Promise<AdhocReservation[]> => {
    const response = await fetch(`${getBaseUrl()}/adhoc/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<AdhocReservation> = await response.json();
    return data.records || [];
  },

  // Reservation Detail APIs
  getStandardReservationDetail: async (
    token: string,
    reservationId: number,
  ): Promise<StandardReservationDetail | null> => {
    const response = await fetch(`${getBaseUrl()}/reservations/${reservationId}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<StandardReservationDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getAdhocReservationDetail: async (token: string, reservationId: number): Promise<AdhocReservationDetail | null> => {
    const response = await fetch(`${getBaseUrl()}/adhoc/reservations/?record_id=${reservationId}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<AdhocReservationDetail> = await response.json();
    return data.records?.[0] || null;
  },

  // Location Detail APIs
  getLocationDetail: async (token: string, locationId: number): Promise<LocationDetail | null> => {
    const response = await fetch(`${getBaseUrl()}/locations/?record_id=${locationId}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<LocationDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getLocationStandardReservations: async (
    token: string,
    locationId: number,
    numRecords: number = 100,
  ): Promise<StandardReservation[]> => {
    const response = await fetch(`${getBaseUrl()}/reservations/?location_id=${locationId}&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<StandardReservation> = await response.json();
    return data.records || [];
  },

  getLocationAdhocReservations: async (
    token: string,
    locationId: number,
    numRecords: number = 100,
  ): Promise<AdhocReservation[]> => {
    const response = await fetch(
      `${getBaseUrl()}/adhoc/reservations/?location_id=${locationId}&num_records=${numRecords}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    const data: ApiResponse<AdhocReservation> = await response.json();
    return data.records || [];
  },

  // Pod Detail APIs
  getPodDetail: async (token: string, podId: number): Promise<PodDetail | null> => {
    const response = await fetch(`${getBaseUrl()}/pods/?record_id=${podId}&num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<PodDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getPodLogs: async (token: string, podId: number, numRecords: number = 100): Promise<LogEntry[]> => {
    const response = await fetch(`${getLogsBaseUrl()}logs/?record_id=${podId}&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<LogEntry> = await response.json();
    return data.records || [];
  },

  // Pod Update APIs
  updatePodMode: async (token: string, podId: number, podMode: string): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/pods/${podId}?verbose=true`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pod_mode: podMode }),
    });
    if (!response.ok) {
      throw new Error("Failed to update pod mode");
    }
  },

  updatePodVersion: async (token: string, podId: number, versionData: any): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/pods/${podId}?verbose=true`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(versionData),
    });
    if (!response.ok) {
      throw new Error("Failed to update pod version");
    }
  },

  updatePodFE: async (token: string, podId: number, feData: { fe_tag: string; fe_details: string }): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/pods/${podId}?verbose=true`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feData),
    });
    if (!response.ok) {
      throw new Error("Failed to update pod FE");
    }
  },

  updatePod: async (token: string, podId: number, podData: any): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/pods/?record_id=${podId}&order_by_field=updated_at&order_by_type=DESC`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podData),
    });
    if (!response.ok) {
      throw new Error("Failed to update pod");
    }
  },

  // User CRUD APIs
  createUser: async (token: string, userData: CreateUserData): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/users/`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
  },

  // User Detail APIs
  getUserDetail: async (token: string, userId: number): Promise<UserDetail | null> => {
    const response = await fetch(`${getBaseUrl()}/users/?record_id=${userId}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<UserDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getUserLocations: async (token: string, userId: number): Promise<UserLocation[]> => {
    const response = await fetch(`${getBaseUrl()}/users/locations/?user_id=${userId}&order_by_field=updated_at&order_by_type=DESC`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<UserLocation> = await response.json();
    return data.records || [];
  },

  getUserReservations: async (token: string, phoneNum: string): Promise<UserReservation[]> => {
    const response = await fetch(`${getBaseUrl()}/reservations/?phone_num=${phoneNum}&order_by_field=updated_at&order_by_type=DESC`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<UserReservation> = await response.json();
    return data.records || [];
  },

  // Resend OTP APIs
  resendReservationOTP: async (token: string, reservationId: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/reservations/${reservationId}/resend-otp`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to resend OTP");
    }
  },

  resendAdhocDropOTP: async (token: string, reservationId: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/adhoc/reservations/${reservationId}/resend-drop-otp`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to resend drop OTP");
    }
  },

  resendAdhocPickupOTP: async (token: string, reservationId: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/adhoc/reservations/${reservationId}/resend-pickup-otp`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to resend pickup OTP");
    }
  },
};

export type {
  Location,
  Pod,
  User,
  Reservation,
  StandardReservation,
  AdhocReservation,
  StandardReservationDetail,
  AdhocReservationDetail,
  LocationDetail,
  PodDetail,
  LogEntry,
  CreateUserData,
  UserDetail,
  UserLocation,
  UserReservation,
  PodStats,
  PodMonitorResponse,
};
