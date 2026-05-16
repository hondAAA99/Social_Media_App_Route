import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});
let accessToken = null;
apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const refreshToken = Cookies.get("refreshToken");
            if (!refreshToken) {
                window.location.href = "/login";
                return Promise.reject(error);
            }
            const response = await axios.get(`${API_BASE_URL}/users/generate-access-token`, {
                headers: {
                    Cookie: `refreshToken=${refreshToken}`,
                },
                withCredentials: true,
            });
            accessToken = response.data.accessToken;
            return apiClient(originalRequest);
        }
        catch (refreshError) {
            Cookies.remove("refreshToken");
            accessToken = null;
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }
    if (error.response?.status === 403) {
        window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
});
export const setAccessToken = (token) => {
    accessToken = token;
};
export const clearAccessToken = () => {
    accessToken = null;
};
export const getAccessToken = () => {
    return accessToken;
};
export default apiClient;
