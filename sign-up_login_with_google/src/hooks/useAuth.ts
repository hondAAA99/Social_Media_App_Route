import { useCallback } from "react";
import { useAuthStore } from "@store/authStore";
import authApi from "@api/auth.api";
import { setAccessToken as setAxiosAccessToken } from "@api/axios.config";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setAccessToken: setAuthToken,
    setIsLoading,
    setError,
    login,
    logout: logoutStore,
    updateUser,
  } = useAuthStore();

  const signup = useCallback(
    async (payload: Parameters<typeof authApi.signup>[0]) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.signup(payload);
        setAuthToken(response.accessToken);
        setAxiosAccessToken(response.accessToken);
        setUser(response.user);
        return { success: true, user: response.user };
      } catch (err: any) {
        const message = err.response?.data?.message || "Signup failed";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, setAuthToken, setUser],
  );

  const confirmSignUp = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.confirmSignUp(token);
        setAuthToken(response.accessToken);
        setAxiosAccessToken(response.accessToken);
        setUser(response.user);
        return { success: true, user: response.user };
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Email confirmation failed";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, setAuthToken, setUser],
  );

  const loginUser = useCallback(
    async (payload: Parameters<typeof authApi.login>[0]) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.login(payload);
        login(response.user, response.accessToken, response.refreshToken);
        setAxiosAccessToken(response.accessToken);
        return {
          success: true,
          user: response.user,
          requires2FA: response.user.is2FAEnabled,
        };
      } catch (err: any) {
        const message = err.response?.data?.message || "Login failed";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, login],
  );

  const confirmLogin = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.confirmLogin(code);
        login(response.user, response.accessToken, response.refreshToken);
        setAxiosAccessToken(response.accessToken);
        return { success: true, user: response.user };
      } catch (err: any) {
        const message =
          err.response?.data?.message || "2FA verification failed";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, login],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      logoutStore();
      setAxiosAccessToken(null);
    } catch (err) {
      logoutStore();
      setAxiosAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, logoutStore]);

  const send2FACode = useCallback(async () => {
    setError(null);
    try {
      const response = await authApi.send2FACode();
      return { success: true, message: response.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to send 2FA code";
      setError(message);
      return { success: false, error: message };
    }
  }, [setError]);

  const enable2FA = useCallback(async () => {
    setError(null);
    try {
      const response = await authApi.enable2FA();
      return { success: true, message: response.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to enable 2FA";
      setError(message);
      return { success: false, error: message };
    }
  }, [setError]);

  const forgetPassword = useCallback(
    async (email: string) => {
      setError(null);
      try {
        const response = await authApi.forgetPassword(email);
        return { success: true, message: response.message };
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to send reset email";
        setError(message);
        return { success: false, error: message };
      }
    },
    [setError],
  );

  const resetPassword = useCallback(
    async (token: string, password: string, confirmPassword: string) => {
      setError(null);
      try {
        const response = await authApi.resetPassword(
          token,
          password,
          confirmPassword,
        );
        return { success: true, message: response.message };
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to reset password";
        setError(message);
        return { success: false, error: message };
      }
    },
    [setError],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signup,
    confirmSignUp,
    login: loginUser,
    confirmLogin,
    logout,
    send2FACode,
    enable2FA,
    forgetPassword,
    resetPassword,
    updateUser,
  };
};
