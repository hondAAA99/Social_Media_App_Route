import apiClient, { setAccessToken, clearAccessToken } from "./axios.config";
import {
  IUser,
  IAuthResponse,
  ISignupPayload,
  ILoginPayload,
  IConfirmSignupPayload,
  IGoogleAuthPayload,
} from "@types/index";
import Cookies from "js-cookie";

export const authApi = {
  /**
   * Sign up with email, password, and optional profile picture
   */
  async signup(payload: ISignupPayload) {
    const formData = new FormData();
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    if (payload.attachment) {
      formData.append("attachment", payload.attachment);
    }

    const response = await apiClient.post<IAuthResponse>(
      "/users/signup",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  /**
   * Confirm email after signup
   */
  async confirmSignUp(token: string) {
    const response = await apiClient.get<IAuthResponse>(
      "/users/confirm-sign-up",
      {
        params: { token },
      },
    );

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        Cookies.set("refreshToken", response.data.refreshToken, {
          secure: true,
          sameSite: "Strict",
          httpOnly: false, // JS cookies can't set httpOnly
        });
      }
    }

    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(payload: ILoginPayload) {
    const response = await apiClient.get<IAuthResponse>("/users/login", {
      params: payload,
    });

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        Cookies.set("refreshToken", response.data.refreshToken, {
          secure: true,
          sameSite: "Strict",
        });
      }
    }

    return response.data;
  },

  /**
   * Login confirmation (2FA verification)
   */
  async confirmLogin(code: string) {
    const response = await apiClient.get<IAuthResponse>(
      "/users/confirm-login",
      {
        params: { code },
      },
    );

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        Cookies.set("refreshToken", response.data.refreshToken, {
          secure: true,
          sameSite: "Strict",
        });
      }
    }

    return response.data;
  },

  /**
   * Sign up with Google
   */
  async signUpWithGoogle(payload: IGoogleAuthPayload) {
    const response = await apiClient.post<IAuthResponse>(
      "/users/signup/gmail",
      payload,
    );

    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        Cookies.set("refreshToken", response.data.refreshToken, {
          secure: true,
          sameSite: "Strict",
        });
      }
    }

    return response.data;
  },

  /**
   * Send 2FA code via email
   */
  async send2FACode() {
    const response = await apiClient.get(
      "/users/send-two-step-verfication-email",
    );
    return response.data;
  },

  /**
   * Enable 2FA
   */
  async enable2FA() {
    const response = await apiClient.get("/users/enable-two-step-verfication");
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    const response = await apiClient.get<{ accessToken: string }>(
      "/users/generate-access-token",
    );
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  },

  /**
   * Get access token
   */
  async getAccessToken() {
    const response = await apiClient.get<{ accessToken: string }>(
      "/users/generate-access-token",
    );
    return response.data;
  },

  /**
   * Send password reset email
   */
  async forgetPassword(email: string) {
    const response = await apiClient.patch("/users/forget-password", { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    const response = await apiClient.patch("/users/reset-password", {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  },

  /**
   * Resend OTP
   */
  async resendOtp(email: string) {
    const response = await apiClient.get("/users/resend-otp", {
      params: { email },
    });
    return response.data;
  },

  /**
   * Generate one-time access link
   */
  async generateOneTimeLink() {
    const response = await apiClient.get<{ link: string }>(
      "/users/one-time-link",
    );
    return response.data;
  },

  /**
   * Validate magic link and password reset
   */
  async validateMagicLink(
    accessToken: string,
    password?: string,
    confirmPassword?: string,
  ) {
    const response = await apiClient.get(
      "/users/validateMagicLinkAndPassword/:accessToken",
      {
        params: {
          password,
          confirmPassword,
        },
      },
    );
    return response.data;
  },

  /**
   * Logout
   */
  async logout() {
    try {
      await apiClient.delete("/users/logout");
    } catch (error) {
      // Continue logout even if API call fails
    }

    clearAccessToken();
    Cookies.remove("refreshToken");
  },
};

export default authApi;
