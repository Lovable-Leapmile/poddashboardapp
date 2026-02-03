import { apiUrls } from "@/lib/api";

// Hook to get the dynamic API base URL
export const useApiUrl = () => {
  return {
    podcore: apiUrls.podcore,
    payments: apiUrls.payments,
    notifications: apiUrls.notifications,
    logstore: apiUrls.logstore,
  };
};
