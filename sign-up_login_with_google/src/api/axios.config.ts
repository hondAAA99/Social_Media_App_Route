import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Store access token in memory (not localStorage for security)
let accessToken: string | null = null;

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          // No refresh token, user must login again
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const response = await axios.get(
          `${API_BASE_URL}/users/generate-access-token`,
          {
            headers: {
              Cookie: `refreshToken=${refreshToken}`,
            },
            withCredentials: true,
          },
        );

        accessToken = response.data.accessToken;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove("refreshToken");
        accessToken = null;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }

    return Promise.reject(error);
  },
);

/**
 * Set access token (called after successful login)
 */
export const setAccessToken = (token: string) => {
  accessToken = token;
};

/**
 * Clear access token (called on logout)
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Get current access token
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

export default apiClient;
