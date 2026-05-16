import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";
const TwoFactorPage = () => {
    const navigate = useNavigate();
    const { confirmLogin, isLoading, error } = useAuth();
    const [code, setCode] = useState("");
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccess(false);
        if (!code.trim()) {
            setApiError("Please enter the 2FA code");
            return;
        }
        const result = await confirmLogin(code);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        }
        else {
            setApiError(result.error);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle, { className: "mx-auto mb-4 text-green-600", size: 64 }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Verified!" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Your two-factor authentication was successful." }), _jsx("p", { className: "text-sm text-gray-600", children: "Redirecting to dashboard..." }), _jsx(LoadingSpinner, { size: "sm", message: "" })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-1", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Enter the 6-digit code from your authenticator app or email." }), (apiError || error) && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: apiError || error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-700 mb-2", children: "Verification Code" }), _jsx("input", { type: "text", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)), placeholder: "000000", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center tracking-widest font-mono text-2xl", maxLength: 6, autoFocus: true })] }), _jsx("button", { type: "submit", disabled: isLoading || code.length !== 6, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? "Verifying..." : "Verify Code" })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Didn't receive the code?", " ", _jsx("button", { type: "button", className: "text-primary-600 hover:text-primary-700 font-medium", children: "Resend" })] }) })] }));
};
export default TwoFactorPage;
