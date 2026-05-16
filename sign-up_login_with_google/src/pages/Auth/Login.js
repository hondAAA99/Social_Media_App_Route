import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState(null);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data) => {
        setApiError(null);
        const result = await login(data);
        if (result.success) {
            if (result.requires2FA) {
                navigate("/two-factor");
            }
            else {
                navigate("/dashboard");
            }
        }
        else {
            setApiError(result.error);
        }
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-1", children: "Welcome Back" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Login to your account to continue" }), (apiError || error) && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: apiError || error })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { ...register("email"), type: "email", placeholder: "your.email@example.com", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register("password"), type: showPassword ? "text" : "password", placeholder: "Enter your password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-gray-600 hover:text-gray-700", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), errors.password && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.password.message }))] }), _jsx("div", { className: "text-right", children: _jsx(Link, { to: "/forgot-password", className: "text-sm text-primary-600 hover:text-primary-700 font-medium", children: "Forgot password?" }) }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", children: isLoading ? _jsx(LoadingSpinner, { size: "sm", message: "" }) : "Login" })] }), _jsxs("p", { className: "mt-6 text-center text-gray-600", children: ["Don't have an account?", " ", _jsx(Link, { to: "/signup", className: "text-primary-600 hover:text-primary-700 font-medium", children: "Sign up" })] })] }));
};
export default LoginPage;
