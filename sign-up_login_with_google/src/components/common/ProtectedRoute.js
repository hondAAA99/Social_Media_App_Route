import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import LoadingSpinner from "./LoadingSpinner";
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx(LoadingSpinner, {}) }));
    }
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
