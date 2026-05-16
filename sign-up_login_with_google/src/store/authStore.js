import { create } from "zustand";
import Cookies from "js-cookie";
export const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
    }),
    setAccessToken: (accessToken) => set({
        accessToken,
        isAuthenticated: !!accessToken,
    }),
    setRefreshToken: (refreshToken) => set({ refreshToken }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    login: (user, accessToken, refreshToken) => {
        if (refreshToken) {
            Cookies.set("refreshToken", refreshToken, {
                secure: import.meta.env.PROD,
                sameSite: "Strict",
            });
        }
        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            error: null,
        });
    },
    logout: () => {
        Cookies.remove("refreshToken");
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
        });
    },
    updateUser: (userUpdate) => set((state) => ({
        user: state.user ? { ...state.user, ...userUpdate } : null,
    })),
    hydrate: () => {
        const refreshToken = Cookies.get("refreshToken");
        if (refreshToken) {
            set({ refreshToken });
        }
    },
}));
