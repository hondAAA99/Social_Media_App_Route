import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
const AuthLayout = () => {
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-primary-600 mb-2", children: "Saraha" }), _jsx("p", { className: "text-gray-600", children: "Secure Messaging Platform" })] }), _jsx("div", { className: "bg-white rounded-lg shadow-lg p-8", children: _jsx(Outlet, {}) }), _jsx("div", { className: "text-center mt-8 text-sm text-gray-600", children: _jsx("p", { children: "\u00A9 2024 Saraha. All rights reserved." }) })] }) }));
};
export default AuthLayout;
