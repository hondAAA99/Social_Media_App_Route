import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
const UnauthorizedPage = () => {
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(Lock, { className: "mx-auto mb-6 text-red-600", size: 64 }), _jsx("h1", { className: "text-5xl font-bold text-gray-800 mb-2", children: "403" }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "Access Denied" }), _jsx("p", { className: "text-gray-600 mb-8 max-w-md", children: "You don't have permission to access this resource." }), _jsx(Link, { to: "/dashboard", className: "inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium", children: "Go to Dashboard" })] }) }));
};
export default UnauthorizedPage;
