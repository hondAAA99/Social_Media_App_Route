import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, Eye, EyeOff, Upload } from "lucide-react";
const SignupPage = () => {
    const navigate = useNavigate();
    const { signup, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [apiError, setApiError] = useState(null);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(signupSchema),
    });
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const onSubmit = async (data) => {
        setApiError(null);
        const result = await signup({
            ...data,
            attachment: profilePicture || undefined,
        });
        if (result.success) {
            navigate("/confirm-email");
        }
        else {
            setApiError(result.error);
        }
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-1", children: "Create Account" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Join Saraha to start messaging securely" }), (apiError || error) && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: apiError || error })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Profile Picture (Optional)" }), _jsxs("div", { className: "flex gap-4", children: [previewUrl ? (_jsx("img", { src: previewUrl, alt: "Profile Preview", className: "w-20 h-20 rounded-full object-cover border-2 border-primary-500" })) : (_jsx("div", { className: "w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center", children: _jsx(Upload, { size: 24, className: "text-gray-400" }) })), _jsxs("div", { className: "flex-1", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleFileChange, className: "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer" }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Max 2MB, PNG or JPG" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700 mb-2", children: "First Name" }), _jsx("input", { ...register("firstName"), type: "text", placeholder: "John", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.firstName && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.firstName.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Last Name" }), _jsx("input", { ...register("lastName"), type: "text", placeholder: "Doe", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.lastName && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.lastName.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { ...register("email"), type: "email", placeholder: "your.email@example.com", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register("password"), type: showPassword ? "text" : "password", placeholder: "Enter a strong password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-gray-600 hover:text-gray-700", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), errors.password && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.password.message })), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u2022 At least 8 characters with uppercase, lowercase, number, and special character" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register("confirmPassword"), type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-2.5 text-gray-600 hover:text-gray-700", children: showConfirmPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), errors.confirmPassword && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.confirmPassword.message }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", children: isLoading ? (_jsx(LoadingSpinner, { size: "sm", message: "" })) : ("Create Account") })] }), _jsxs("p", { className: "mt-6 text-center text-gray-600", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "text-primary-600 hover:text-primary-700 font-medium", children: "Login" })] })] }));
};
export default SignupPage;
