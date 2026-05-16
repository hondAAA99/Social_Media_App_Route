import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
const NotFoundPage = () => {
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "mx-auto mb-6 text-primary-600", size: 64 }), _jsx("h1", { className: "text-5xl font-bold text-gray-800 mb-2", children: "404" }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "Page not found" }), _jsx("p", { className: "text-gray-600 mb-8 max-w-md", children: "The page you're looking for doesn't exist or has been moved." }), _jsx(Link, { to: "/", className: "inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium", children: "Go Home" })] }) }));
};
export default NotFoundPage;
