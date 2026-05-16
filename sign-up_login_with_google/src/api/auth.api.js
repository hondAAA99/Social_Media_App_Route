import apiClient, { setAccessToken, clearAccessToken } from "./axios.config";
import Cookies from "js-cookie";
export const authApi = {
    async signup(payload) {
        const formData = new FormData();
        formData.append("firstName", payload.firstName);
        formData.append("lastName", payload.lastName);
        formData.append("email", payload.email);
        formData.append("password", payload.password);
        if (payload.attachment) {
            formData.append("attachment", payload.attachment);
        }
        const response = await apiClient.post("/users/signup", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    async confirmSignUp(token) {
        const response = await apiClient.get("/users/confirm-sign-up", {
            params: { token },
        });
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            if (response.data.refreshToken) {
                Cookies.set("refreshToken", response.data.refreshToken, {
                    secure: true,
                    sameSite: "Strict",
                    httpOnly: false,
                });
            }
        }
        return response.data;
    },
    async login(payload) {
        const response = await apiClient.get("/users/login", {
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
    async confirmLogin(code) {
        const response = await apiClient.get("/users/confirm-login", {
            params: { code },
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
    async signUpWithGoogle(payload) {
        const response = await apiClient.post("/users/signup/gmail", payload);
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
    async send2FACode() {
        const response = await apiClient.get("/users/send-two-step-verfication-email");
        return response.data;
    },
    async enable2FA() {
        const response = await apiClient.get("/users/enable-two-step-verfication");
        return response.data;
    },
    async refreshAccessToken() {
        const response = await apiClient.get("/users/generate-access-token");
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        return response.data;
    },
    async getAccessToken() {
        const response = await apiClient.get("/users/generate-access-token");
        return response.data;
    },
    async forgetPassword(email) {
        const response = await apiClient.patch("/users/forget-password", { email });
        return response.data;
    },
    async resetPassword(token, password, confirmPassword) {
        const response = await apiClient.patch("/users/reset-password", {
            token,
            password,
            confirmPassword,
        });
        return response.data;
    },
    async resendOtp(email) {
        const response = await apiClient.get("/users/resend-otp", {
            params: { email },
        });
        return response.data;
    },
    async generateOneTimeLink() {
        const response = await apiClient.get("/users/one-time-link");
        return response.data;
    },
    async validateMagicLink(accessToken, password, confirmPassword) {
        const response = await apiClient.get("/users/validateMagicLinkAndPassword/:accessToken", {
            params: {
                password,
                confirmPassword,
            },
        });
        return response.data;
    },
    async logout() {
        try {
            await apiClient.delete("/users/logout");
        }
        catch (error) {
        }
        clearAccessToken();
        Cookies.remove("refreshToken");
    },
};
export default authApi;
