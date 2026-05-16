import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });
    if (!token) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(AlertCircle, { className: "mx-auto mb-4 text-red-600", size: 64 }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Invalid Link" }), _jsx("p", { className: "text-gray-600 mb-6", children: "The password reset link is invalid or has expired." }), _jsxs(Link, { to: "/forgot-password", className: "inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium", children: [_jsx(ArrowLeft, { size: 16 }), "Request New Link"] })] }));
    }
    const onSubmit = async (data) => {
        setApiError(null);
        setSuccess(false);
        const result = await resetPassword(token, data.password, data.confirmPassword);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
        else {
            setApiError(result.error);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle, { className: "mx-auto mb-4 text-green-600", size: 64 }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Password Reset Successful" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Your password has been reset successfully." }), _jsx("p", { className: "text-sm text-gray-600", children: "Redirecting to login..." }), _jsx(LoadingSpinner, { size: "sm", message: "" })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-1", children: "Reset Your Password" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Enter your new password below" }), (apiError || error) && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: apiError || error })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-2", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register("password"), type: showPassword ? "text" : "password", placeholder: "Enter a strong password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-gray-600 hover:text-gray-700", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), errors.password && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.password.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register("confirmPassword"), type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-2.5 text-gray-600 hover:text-gray-700", children: showConfirmPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), errors.confirmPassword && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.confirmPassword.message }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? "Resetting..." : "Reset Password" })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium", children: [_jsx(ArrowLeft, { size: 16 }), "Back to Login"] }) })] }));
};
export default ResetPasswordPage;
