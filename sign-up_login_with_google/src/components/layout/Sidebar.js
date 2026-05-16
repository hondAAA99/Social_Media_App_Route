import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { Menu, X, Home, Mail, User, LogOut } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
const Sidebar = ({ isOpen, onToggle }) => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuth();
    const isActive = (path) => location.pathname === path;
    const handleLogout = async () => {
        await logout();
    };
    const navLinks = [
        { label: "Dashboard", href: "/dashboard", icon: Home },
        { label: "Messages", href: "/messages", icon: Mail },
        { label: "Profile", href: "/profile", icon: User },
    ];
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onToggle, className: "md:hidden fixed top-4 left-4 z-50 p-2 text-gray-700 hover:bg-gray-200 rounded-lg", children: isOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }), _jsxs("aside", { className: `${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative w-64 h-screen bg-white border-r border-gray-200 shadow-lg md:shadow-none z-40 transition-transform duration-300`, children: [_jsx("div", { className: "p-6 border-b border-gray-200 mt-16 md:mt-0", children: _jsx(Link, { to: "/dashboard", className: "text-2xl font-bold text-primary-600", children: "Saraha" }) }), user && (_jsxs("div", { className: "p-6 border-b border-gray-200", children: [user.profilePicture && (_jsx("img", { src: user.profilePicture, alt: user.firstName, className: "w-12 h-12 rounded-full mb-3 object-cover" })), _jsxs("p", { className: "font-semibold text-gray-800", children: [user.firstName, " ", user.lastName] }), _jsx("p", { className: "text-sm text-gray-500", children: user.email })] })), _jsx("nav", { className: "p-6 space-y-2", children: navLinks.map(({ label, href, icon: Icon }) => (_jsxs(Link, { to: href, className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(href)
                                ? "bg-primary-100 text-primary-700 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"}`, children: [_jsx(Icon, { size: 20 }), _jsx("span", { children: label })] }, href))) }), _jsx("div", { className: "absolute bottom-6 left-0 right-0 px-6", children: _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium", children: [_jsx(LogOut, { size: 20 }), _jsx("span", { children: "Logout" })] }) })] }), isOpen && (_jsx("div", { className: "md:hidden fixed inset-0 bg-black bg-opacity-50 z-30", onClick: onToggle }))] }));
};
export default Sidebar;
