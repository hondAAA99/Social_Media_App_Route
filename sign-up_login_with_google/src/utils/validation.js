import { z } from "zod";
import DOMPurify from "dompurify";
export const signupSchema = z
    .object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters"),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    profilePicture: z.instanceof(File).optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export const updateProfileSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters")
        .optional(),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters")
        .optional(),
    email: z.string().email("Invalid email address").optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    phone: z
        .string()
        .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number")
        .optional(),
});
export const updatePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
export const resetPasswordSchema = z
    .object({
    token: z.string(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const sendMessageSchema = z.object({
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(5000, "Message is too long"),
    attachments: z
        .array(z.instanceof(File))
        .max(3, "Maximum 3 files allowed")
        .optional(),
});
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PROFILE_PIC_SIZE = 2 * 1024 * 1024;
export const validateImageFile = (file, maxSize = MAX_FILE_SIZE) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error("Only image files are allowed (JPG, PNG, GIF, WebP)");
    }
    if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
    return true;
};
export const validateProfilePicture = (file) => {
    return validateImageFile(file, MAX_PROFILE_PIC_SIZE);
};
export const validateCoverPhotos = (files) => {
    if (files.length > 2) {
        throw new Error("Maximum 2 cover photos allowed");
    }
    files.forEach((file) => validateImageFile(file));
    return true;
};
export const validateMessageAttachments = (files) => {
    if (files.length > 3) {
        throw new Error("Maximum 3 files per message");
    }
    files.forEach((file) => validateImageFile(file));
    return true;
};
export const sanitizeHTML = (html) => {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};
export const escapeHtml = (text) => {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
};
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
export const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};
export const formatFullName = (firstName, lastName) => {
    return `${firstName} ${lastName}`.trim();
};
