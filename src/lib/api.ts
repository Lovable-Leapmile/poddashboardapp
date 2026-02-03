// Centralized API URL configuration
// All API calls should use this utility

const getBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_BASE_URL;
  
  if (envBaseUrl) {
    // Extract base up to .com only
    const match = envBaseUrl.match(/^(https?:\/\/[^/]+\.com)/);
    return match ? match[1] : envBaseUrl;
  }
  
  // Fallback for development/staging
  const stored = localStorage.getItem("api_base_url");
  if (stored) {
    const match = stored.match(/^(https?:\/\/[^/]+\.com)/);
    return match ? match[1] : stored.replace("/podcore", "");
  }
  
  return "https://productionv36.qikpod.com";
};

export const apiUrls = {
  get base() {
    return getBaseUrl();
  },
  get podcore() {
    return `${getBaseUrl()}/podcore`;
  },
  get payments() {
    return `${getBaseUrl()}/payments`;
  },
  get notifications() {
    return `${getBaseUrl()}/notifications`;
  },
  get logstore() {
    return `${getBaseUrl()}/logstore`;
  },
};

// Hook version for React components
export const useApiUrls = () => {
  return apiUrls;
};
