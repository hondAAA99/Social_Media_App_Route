import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children, }) => {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast = { id, message, type, duration };
        setToasts((prev) => [...prev, toast]);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { toasts, addToast, removeToast }, children: [children, _jsx(ToastContainer, {})] }));
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};
const ToastContainer = () => {
    const { toasts, removeToast } = useToast();
    const getIcon = (type) => {
        switch (type) {
            case "success":
                return _jsx(CheckCircle, { size: 20, className: "text-green-600" });
            case "error":
                return _jsx(AlertCircle, { size: 20, className: "text-red-600" });
            case "warning":
                return _jsx(AlertTriangle, { size: 20, className: "text-yellow-600" });
            default:
                return _jsx(Info, { size: 20, className: "text-blue-600" });
        }
    };
    const getStyles = (type) => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200 text-green-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            default:
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 space-y-3 max-w-md pointer-events-none", children: toasts.map((toast) => (_jsxs("div", { className: `flex items-center gap-3 p-4 rounded-lg border pointer-events-auto animate-slide-down ${getStyles(toast.type)}`, children: [getIcon(toast.type), _jsx("p", { className: "flex-1", children: toast.message }), _jsx("button", { onClick: () => removeToast(toast.id), className: "ml-2 hover:opacity-70 transition-opacity", children: _jsx(X, { size: 16 }) })] }, toast.id))) }));
};
