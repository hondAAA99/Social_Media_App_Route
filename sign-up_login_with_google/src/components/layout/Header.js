import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, Bell } from "lucide-react";
const Header = ({ onMenuToggle }) => {
    return (_jsxs("header", { className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: onMenuToggle, className: "md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Menu, { size: 24, className: "text-gray-700" }) }), _jsx("h1", { className: "text-xl font-semibold text-gray-800", children: "Welcome to Saraha" })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs("button", { className: "p-2 hover:bg-gray-100 rounded-lg transition-colors relative", children: [_jsx(Bell, { size: 20, className: "text-gray-700" }), _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })] }) })] }));
};
export default Header;
