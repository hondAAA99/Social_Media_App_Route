import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
const ForgotPasswordPage = () => {
    const { forgetPassword, isLoading, error } = useAuth();
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });
    const onSubmit = async (data) => {
        setApiError(null);
        setSuccess(false);
        const result = await forgetPassword(data.email);
        if (result.success) {
            setSuccess(true);
            setSubmittedEmail(data.email);
        }
        else {
            setApiError(result.error);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle, { className: "mx-auto mb-4 text-green-600", size: 64 }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Check Your Email" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["We've sent a password reset link to ", _jsx("strong", { children: submittedEmail })] }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "The link will expire in 1 hour. If you don't see the email, check your spam folder." }), _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium", children: [_jsx(ArrowLeft, { size: 16 }), "Back to Login"] })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-1", children: "Reset Password" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Enter your email address and we'll send you a link to reset your password." }), (apiError || error) && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: apiError || error })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { ...register("email"), type: "email", placeholder: "your.email@example.com", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.email.message }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", children: isLoading ? (_jsx(LoadingSpinner, { size: "sm", message: "" })) : ("Send Reset Link") })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium", children: [_jsx(ArrowLeft, { size: 16 }), "Back to Login"] }) })] }));
};
export default ForgotPasswordPage;
