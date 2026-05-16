import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false, isLoading = false, }) => {
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 transition-colors", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "p-6", children: children }), onConfirm && (_jsxs("div", { className: "flex gap-3 px-6 pb-6", children: [_jsx("button", { onClick: onClose, disabled: isLoading, className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50", children: cancelText }), _jsx("button", { onClick: onConfirm, disabled: isLoading, className: `flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-white disabled:opacity-50 ${isDangerous
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-primary-600 hover:bg-primary-700"}`, children: isLoading ? "Loading..." : confirmText })] }))] })] }));
};
export default Modal;
