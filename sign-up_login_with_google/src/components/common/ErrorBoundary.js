import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { AlertCircle } from "lucide-react";
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 max-w-md text-center", children: [_jsx(AlertCircle, { className: "mx-auto mb-4 text-red-600", size: 64 }), _jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-2", children: "Oops! Something went wrong" }), _jsx("p", { className: "text-gray-600 mb-4", children: "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists." }), process.env.NODE_ENV === "development" && this.state.error && (_jsxs("details", { className: "mt-4 text-left text-sm", children: [_jsx("summary", { className: "cursor-pointer font-semibold text-gray-700 mb-2", children: "Error Details (Development Only)" }), _jsxs("pre", { className: "bg-gray-100 p-3 rounded overflow-auto text-xs text-gray-800", children: [this.state.error.message, "\n\n", this.state.error.stack] })] })), _jsx("button", { onClick: () => window.location.reload(), className: "mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium", children: "Refresh Page" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
