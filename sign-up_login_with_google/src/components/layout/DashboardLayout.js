import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import { useState } from "react";
const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onToggle: () => setSidebarOpen(!sidebarOpen) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, { onMenuToggle: () => setSidebarOpen(!sidebarOpen) }), _jsx("main", { className: "flex-1 overflow-auto p-6", children: _jsx(Outlet, {}) })] })] }));
};
export default DashboardLayout;
