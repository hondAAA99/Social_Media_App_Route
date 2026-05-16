import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@store/authStore";
import ProtectedRoute from "@components/common/ProtectedRoute";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { ToastProvider } from "@components/common/Toast";
import AuthLayout from "@components/layout/AuthLayout";
import DashboardLayout from "@components/layout/DashboardLayout";
import LoginPage from "@pages/Auth/Login";
import SignupPage from "@pages/Auth/Signup";
import ConfirmEmailPage from "@pages/Auth/ConfirmEmail";
import ForgotPasswordPage from "@pages/Auth/ForgotPassword";
import ResetPasswordPage from "@pages/Auth/ResetPassword";
import TwoFactorPage from "@pages/Auth/TwoFactor";
import DashboardPage from "@pages/Dashboard/Home";
import ProfilePage from "@pages/Dashboard/Profile";
import MessagesPage from "@pages/Dashboard/Messages";
import EditProfilePage from "@pages/Dashboard/EditProfile";
import NotFoundPage from "@pages/NotFound";
import UnauthorizedPage from "@pages/Unauthorized";
function AppContent() {
    const hydrate = useAuthStore((state) => state.hydrate);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AuthLayout, {}), children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/confirm-email", element: _jsx(ConfirmEmailPage, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password/:token", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/two-factor", element: _jsx(TwoFactorPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/profile/:userId", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/profile/edit", element: _jsx(EditProfilePage, {}) }), _jsx(Route, { path: "/messages", element: _jsx(MessagesPage, {}) })] }), _jsx(Route, { path: "/unauthorized", element: _jsx(UnauthorizedPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(ToastProvider, { children: _jsx(AppContent, {}) }) }));
}
export default App;
