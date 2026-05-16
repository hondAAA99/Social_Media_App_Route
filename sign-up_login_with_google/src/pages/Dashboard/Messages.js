import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessageSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, Send, Image, Trash2 } from "lucide-react";
const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        resolver: zodResolver(sendMessageSchema),
    });
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                setMessages([]);
            }
            catch (err) {
                setError("Failed to load messages");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, []);
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        setAttachments(files);
    };
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            reset();
            setAttachments([]);
        }
        catch (err) {
            setError(err.response?.data?.message || "Failed to send message");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteMessage = async (messageId) => {
        if (!confirm("Are you sure you want to delete this message?"))
            return;
        try {
            setMessages(messages.filter((m) => m._id !== messageId));
        }
        catch (err) {
            setError("Failed to delete message");
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "Send a Message" }), error && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: error })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "content", className: "block text-sm font-medium text-gray-700 mb-2", children: "Message" }), _jsx("textarea", { ...register("content"), placeholder: "Write your message here...", rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" }), errors.content && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.content.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Attachments (Optional)" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleFileChange, className: "flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer" }), _jsx(Image, { className: "text-gray-400", size: 24 })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Max 3 files, 5MB each" }), attachments.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: attachments.map((file, idx) => (_jsxs("p", { className: "text-sm text-primary-600", children: ["\u2713 ", file.name] }, idx))) }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: isLoading ? (_jsx(_Fragment, { children: _jsx(LoadingSpinner, { size: "sm", message: "" }) })) : (_jsxs(_Fragment, { children: [_jsx(Send, { size: 20 }), "Send Message"] })) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "Your Messages" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Total: ", messages.length, " messages"] })] }), messages.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "No messages yet" }), _jsx("p", { className: "text-sm text-gray-500", children: "Send your first message to get started" })] })) : (_jsx("div", { className: "divide-y divide-gray-200", children: messages.map((message) => (_jsxs("div", { className: "p-6 hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-800", children: [message.sender.firstName, " ", message.sender.lastName] }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(message.createdAt).toLocaleString() })] }), _jsx("button", { onClick: () => handleDeleteMessage(message._id), className: "text-red-600 hover:text-red-700 transition-colors", children: _jsx(Trash2, { size: 18 }) })] }), _jsx("p", { className: "text-gray-700 mb-3", children: message.content }), message.attachments && message.attachments.length > 0 && (_jsx("div", { className: "flex gap-3 flex-wrap", children: message.attachments.map((attachment, idx) => (_jsx("img", { src: attachment, alt: `Attachment ${idx + 1}`, className: "w-32 h-32 rounded-lg object-cover" }, idx))) }))] }, message._id))) }))] })] }));
};
export default MessagesPage;
