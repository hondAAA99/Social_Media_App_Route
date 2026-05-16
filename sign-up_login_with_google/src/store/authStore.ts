import { create } from "zustand";
import { IUser, IAuthState } from "@types/index";
import Cookies from "js-cookie";

interface AuthStore extends IAuthState {
  setUser: (user: IUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: IUser, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<IUser>) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setAccessToken: (accessToken) =>
    set({
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

  updateUser: (userUpdate) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userUpdate } : null,
    })),

  /**
   * Hydrate auth state from storage on app init
   */
  hydrate: () => {
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      set({ refreshToken });
    }
  },
}));
