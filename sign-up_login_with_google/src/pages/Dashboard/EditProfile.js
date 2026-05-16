import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuthStore } from "@store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";
const EditProfilePage = () => {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
    const [coverPhotos, setCoverPhotos] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            bio: user?.bio,
            phone: user?.phone,
        },
    });
    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleCoverPhotosChange = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 2);
        setCoverPhotos(files);
    };
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            updateUser(data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        }
        catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!user) {
        return _jsx("div", { className: "text-center py-12", children: "Loading..." });
    }
    return (_jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-8", children: "Edit Your Profile" }), error && (_jsxs("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-red-700", children: error })] })), success && (_jsxs("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3", children: [_jsx(CheckCircle, { className: "text-green-600 flex-shrink-0", size: 20 }), _jsx("p", { className: "text-green-700", children: "Profile updated successfully!" })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Profile Picture" }), _jsxs("div", { className: "flex gap-6", children: [previewUrl && (_jsx("img", { src: previewUrl, alt: "Profile Preview", className: "w-32 h-32 rounded-full object-cover border-4 border-primary-500" })), _jsxs("div", { className: "flex-1", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleProfilePictureChange, className: "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer" }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Max 2MB, PNG or JPG" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Cover Photos (up to 2)" }), _jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleCoverPhotosChange, className: "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer" }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Max 2 files, 5MB each, PNG or JPG" }), coverPhotos.length > 0 && (_jsxs("p", { className: "text-sm text-primary-600 mt-2", children: [coverPhotos.length, " file(s) selected"] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700 mb-2", children: "First Name" }), _jsx("input", { ...register("firstName"), type: "text", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.firstName && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.firstName.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700 mb-2", children: "Last Name" }), _jsx("input", { ...register("lastName"), type: "text", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.lastName && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.lastName.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email" }), _jsx("input", { ...register("email"), type: "email", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone (Optional)" }), _jsx("input", { ...register("phone"), type: "tel", placeholder: "+1 (555) 000-0000", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" }), errors.phone && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.phone.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "bio", className: "block text-sm font-medium text-gray-700 mb-2", children: "Bio (Optional)" }), _jsx("textarea", { ...register("bio"), placeholder: "Tell us about yourself...", rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" }), errors.bio && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.bio.message })), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Max 500 characters" })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", children: isLoading ? (_jsx(LoadingSpinner, { size: "sm", message: "" })) : ("Save Changes") }), _jsx("button", { type: "button", onClick: () => reset(), className: "flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium", children: "Cancel" })] })] })] }) }));
};
export default EditProfilePage;
